---
name: evaluate
description: Evaluate a brand name for domains, social handles, similar companies, and perception
arguments:
  - name: name
    description: The brand name to evaluate
    required: true
---

Evaluate the brand name "$ARGUMENTS.name" using the namecast CLI.

Run: `namecast eval "$ARGUMENTS.name" --json`

Then present the results in a clear, formatted summary including:
- Overall score
- Domain availability (.com, .io, etc.)
- Social handle availability
- Similar companies found
- Pronunciation score
- International issues
- AI perception analysis

If the namecast command is not installed, suggest: `pip install namecast`
