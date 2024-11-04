FUNCTIONS = [
    {
        "name": "run_r_code",
        "description": "Runs arbitrary R code and returns stdout and stderr. "
        + "The code is executed in an interactive R shell, variables and loaded packages are preserved between calls. "
        + "The environment has internet and file system access. "
        + "The current working directory is shared with the user, so files can be exchanged. "
        + "Base R is available, with no preloaded packages. "
        + "You can install packages from GitHub or CRAN like this: install.packages('ggplot2', repos='http://cran.r-project.org'). "
        + "You cannot show rich outputs like plots directly, but you can save them in the working directory and point the user to them. "
        + "If the code runs too long, there will be a timeout. "
        + "Use R's native pipe operator |> for data manipulation chains. "
        + "You have a limited number of characters per response. Do NOT repeat the code outputs, as the user can already see them.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The R code to run",
                },
            },
            "required": ["code"],
        },
    },
]
