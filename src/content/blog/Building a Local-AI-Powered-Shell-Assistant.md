---
title: "Building a Local AI-Powered Shell Assistant (and Making It Global!)"
description: "How I created my own custom ChatGPT-powered terminal assistant that understands natural language, runs locally with Ollama + Mistral, and can be launched from anywhere as a global CLI."
pubDate: 2025-07-21
tags: ["AI", "Shell", "Ollama", "Python", "CLI", "Dev Projects"]
heroImage: '/blog-placeholder-5.jpg'
---

This week, I built my own **AI-powered shell assistant** that runs completely **locally** on my machine using [`Ollama`](https://ollama.com/), [`Mistral`](https://ollama.com/library/mistral), and Python.

It’s kind of like having **ChatGPT inside your terminal**, but on your terms — fast, offline, and private.

Here’s a full breakdown of how it works, how I built it, and how I made it run globally with `shell-assist` from any terminal window.

---

## What It Does

You type a natural-language request in your terminal:

List all folders in the current directory

Your assistant responds with a suggested command:

```bash
ls -d */
```

And then asks:

```bash
 Run this command? (y/n):
```

If you confirm, it runs the command and logs it to a history file for future reference.

## Step-by-Step 

#### 1. Folder structure

Inside your project directory `shell_assistant`, organize things like this:

```bash
shell_assistant/
├── setup.py
├── shell_assistant/
│   ├── __main__.py
│   ├── assistant.py
│   ├── llm_interface.py
│   └── history.json
├── venv/  # virtual environment (optional but recommended)
```

#### 2. Creating the assistant logic

Your `assistant.py` is the core brain. It:

- Loads conversation history

- Talks to `llm_interface.ask_ollama()`

- Parses the shell command from the LLM’s response

- Asks for permission

- Executes using `subprocess.run()`

```python
# assistant.py
import subprocess
import readline  # for history + arrow key input on Linux
from .llm_interface import ask_ollama
import json
import os

HISTORY_FILE = "history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def shell_assistant():
    print("\n Ask your terminal assistant anything (type 'exit' to quit):")
    history = load_history()

    while True:
        try:
            user_input = input("\n You: ").strip()
            if user_input.lower() in ["exit", "quit"]:
                print(" Exiting assistant.")
                break

            print(" Thinking...")
            response = ask_ollama(user_input)

            # Extract shell command from markdown code block
            lines = response.splitlines()
            command = ""
            inside_code = False
            for line in lines:
                if "```" in line:
                    inside_code = not inside_code
                    continue
                if inside_code and not line.startswith("dir"):
                    command += line.strip() + " "
                    break  # only keep first usable suggestion


            command = command.strip()
            print(f"\n Suggested command:\n\033[92m{command}\033[0m")

            confirm = input("\n⚡ Run this command? (y/n): ").strip().lower()
            if confirm == 'y':
                subprocess.run(command, shell=True)
                history.append({"input": user_input, "command": command})
                save_history(history)
            else:
                print("Skipped.")

        except KeyboardInterrupt:
            print("\n Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

```

#### 3. LLM backend (local and private)

We use Ollama to run models like Mistral locally. No API keys. No cloud.

```python
# llm_interface.py
import subprocess

def ask_ollama(prompt):
    """
    Sends the prompt to `ollama run mistral` and returns the response as a string.
    """
    try:
        result = subprocess.run(
            ["ollama", "run", "mistral"],
            input=prompt.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        if result.returncode != 0:
            raise RuntimeError(result.stderr.decode())

        output = result.stdout.decode()
        return output.strip()

    except Exception as e:
        return f"[Error communicating with Ollama] {e}"
```

#### 4. Making it a command-line tool

This is where the magic happens.

Create a `setup.py`:

```python
from setuptools import setup, find_packages

setup(
    name='shell_assist',
    version='0.1',
    packages=find_packages(),
    entry_points={
        'console_scripts': [
            'shell-assist=shell_assistant.__main__:shell_assistant',
        ],
    },
    install_requires=[
        # Add any extras here, like 'python-dotenv'
    ],
)
```

And define `main()` inside `shell_assistant/__main__.py`:

```python
from .assistant import shell_assistant

def main():
    shell_assistant()
```

#### 5. Installing your CLI locally

```bash
# Inside your project folder
$ pip install -e .
```

This registers the shell-assist command — but only inside your virtual environment by default.

## Making it Work Globally

If you want to use `shell-assist` from any terminal (even without activating the venv), you need to update your PATH.

#### Find where it was installed:

```bash
$ which shell-assist
/home/youruser/shell_assistant/venv/bin/shell-assist
```

#### Add to your ~/.bashrc:

```bash
export PATH="$HOME/shell_assistant/venv/bin:$PATH"
```

Then reload:

```bash
$ source ~/.bashrc
```

Now you can open any terminal and run:

```bash
$ shell-assist
```

Boom! It works.

## Final Thoughts

You now have a private, local, AI-powered terminal assistant — and it’s blazing fast thanks to your GPU. This project is a perfect blend of NLP, dev tools, and automation. Whether you're hacking scripts, doing research, or just exploring, you now have your own assistant by your side.