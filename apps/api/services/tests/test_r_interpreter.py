import pytest
from pathlib import Path
from services.interpreter.r_interpreter import RInterpreter


def test_r_interpreter_basic():
    interpreter = RInterpreter()

    # Test basic arithmetic
    result = interpreter.run_cell("2 + 2")
    assert "4" in result

    # Test variable assignment and retrieval
    result = interpreter.run_cell("""
    x <- 10
    y <- 20
    x + y
    """)
    assert "30" in result

    # Test error handling
    result = interpreter.run_cell("nonexistent_variable")
    assert "Error" in result

    # Test data frame creation and manipulation
    result = interpreter.run_cell("""
    df <- data.frame(
        name = c("Alice", "Bob", "Charlie"),
        age = c(25, 30, 35)
    )
    df$age
    """)
    assert "25" in result
    assert "30" in result
    assert "35" in result

    # Test multiple line output
    result = interpreter.run_cell("""
    numbers <- 1:5
    print("First line")
    print("Second line")
    numbers
    """)
    assert "First line" in result
    assert "Second line" in result
    assert "[1] 1 2 3 4 5" in result

    interpreter.stop()


def test_r_interpreter_timeout():
    interpreter = RInterpreter(timeout=1)

    # Test timeout with infinite loop
    result = interpreter.run_cell("""
    while(TRUE) {
        Sys.sleep(0.1)
    }
    """)
    assert result is None

    interpreter.stop()


def test_r_interpreter_working_dir():
    # Create a temporary working directory
    with pytest.raises(Exception):
        # Should fail with nonexistent directory
        RInterpreter(working_dir=Path("/nonexistent/directory"))

    # Test with valid working directory
    interpreter = RInterpreter(working_dir=Path.cwd())
    result = interpreter.run_cell('getwd()')
    assert str(Path.cwd()) in result
    interpreter.stop()


def test_r_interpreter_packages():
    interpreter = RInterpreter()

    # Test loading and using a base package
    result = interpreter.run_cell("""
    library(stats)
    x <- rnorm(100)
    mean(x)
    """)
    assert not "Error" in result

    interpreter.stop()


if __name__ == "__main__":
    pytest.main([__file__])
