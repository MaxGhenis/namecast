---
name: find
description: Generate and evaluate brand names for a project description
arguments:
  - name: description
    description: Description of the project, company, or product
    required: true
  - name: ideas
    description: Optional comma-separated list of your own name ideas
    required: false
---

Find and evaluate brand names for: "$ARGUMENTS.description"

Run the namecast workflow:

```bash
namecast find "$ARGUMENTS.description" ${{ ARGUMENTS.ideas ? `--ideas ${ARGUMENTS.ideas.split(',').map(n => n.trim()).join(' --ideas ')}` : '' }} --json
```

The workflow will:
1. Generate AI name suggestions based on the project description
2. Check domain availability (.com and .io)
3. Filter out names without available domains
4. Fully evaluate the top candidates
5. Recommend the best name

Present the results showing:
- Total candidates generated
- How many passed domain filtering
- The recommended name with its score
- A table of all candidates with their status

If namecast is not installed, suggest: `pip install namecast`
