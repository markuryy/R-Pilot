import os
import sys
from pathlib import Path
from typing import Optional
import tempfile
import time
import queue
import subprocess
import threading


class RInterpreter:
    _END_MESSAGE = "__ INTERPRETER END OF EXECUTION __"
    _LAST_VAR = ".Last.value"

    def __init__(
        self,
        *,
        working_dir: Path = None,
        r_path: Path = None,
        timeout: int = None,
    ):
        # Set working directory to the web public workspace directory
        if working_dir is None:
            root_dir = Path(__file__).parent.parent.parent.parent.parent.parent  # Up to project root
            self._working_dir = root_dir / "apps" / "web" / "public" / "workspace"
        else:
            self._working_dir = working_dir
            
        if r_path is None:
            # Default to system R installation
            self._r_path = Path("Rscript")
        else:
            self._r_path = r_path
        self._timeout = timeout
        self._running = False
        self._start()

    def __del__(self):
        self.stop()

    def _start(self):
        self._process = subprocess.Popen(
            [str(self._r_path), "--vanilla", "--quiet", "--slave"],
            text=True,
            cwd=self._working_dir,
            env=os.environ.copy(),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self._p_stdin = self._process.stdin

        self._stop_threads = False

        self._q_stdout = queue.Queue()
        self._t_stdout = threading.Thread(
            target=self._reader_thread,
            args=(self._process.stdout, self._q_stdout),
            daemon=True,
        )
        self._t_stdout.start()

        self._q_stderr = queue.Queue()
        self._t_stderr = threading.Thread(
            target=self._reader_thread,
            args=(self._process.stderr, self._q_stderr),
            daemon=True,
        )
        self._t_stderr.start()

        self._wait_till_started()
        self._running = True

    def stop(self):
        if self._running:
            self._process.kill()
            self._stop_threads = True
            self._t_stdout.join()
            self._t_stderr.join()
            self._running = False

    def _reader_thread(self, pipe, q):
        while not self._stop_threads:
            line = pipe.readline()
            if line:
                q.put(line)

    def _read_stdout(self, timeout: Optional[int]) -> Optional[str]:
        start = time.time()
        stdout = ""
        while True:
            try:
                line = self._q_stdout.get(timeout=timeout)
            except queue.Empty:
                line = None
            if timeout is not None and time.time() - start > timeout:
                line = None

            if line is None:
                return None

            if self._END_MESSAGE in line:
                break
            stdout += line

        return stdout

    def _read_stderr(self) -> str:
        stderr = ""
        while not self._q_stderr.empty():
            stderr += self._q_stderr.get()
        return stderr

    def _write_stdin(self, text: str):
        self._p_stdin.write(text)
        self._p_stdin.flush()

    def _wait_till_started(self):
        self._write_stdin(f'cat("{self._END_MESSAGE}\\n")\n')
        self._read_stdout(timeout=10)

    def _create_script(self, script: str) -> Path:
        # Wrap the script to capture and print the last value
        wrapped_script = f"""
        # Suppress file connection warnings
        options(warn = -1)
        .Last.value <- tryCatch({{
            {script}
        }}, error = function(e) {{
            cat("Error: ", e$message, "\\n", sep="")
            NULL
        }})
        if (!is.null(.Last.value)) {{
            print(.Last.value)
        }}
        cat("{self._END_MESSAGE}\\n")
        """

        with tempfile.NamedTemporaryFile(mode="w", suffix=".R", delete=False) as f:
            f.write(wrapped_script)

        return Path(f.name)

    def _run_script(self, script_path: Path):
        self._write_stdin(f'source("{script_path}")\n')

    def _fetch_result(self) -> Optional[str]:
        stdout = self._read_stdout(timeout=self._timeout)
        if stdout is None:
            self.stop()
            self._start()
            return None

        stderr = self._read_stderr()
        return stdout + stderr

    def run_cell(self, script: str) -> Optional[str]:
        """Run the R code and return the result.
        Returns None if the interpreter timed out."""
        script_path = self._create_script(script)
        self._run_script(script_path)
        result = self._fetch_result()
        script_path.unlink()
        return result
