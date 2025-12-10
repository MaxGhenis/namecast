"""Command-line interface for Namecast."""

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from namecast.evaluator import BrandEvaluator


console = Console()


@click.command()
@click.argument("names", nargs=-1, required=True)
@click.option("--mission", "-m", help="Company mission for alignment scoring")
@click.option("--json", "output_json", is_flag=True, help="Output as JSON")
@click.option("--compare", is_flag=True, help="Compare multiple names side-by-side")
def main(names: tuple[str, ...], mission: str | None, output_json: bool, compare: bool):
    """Forecast brand name success - availability, pronunciation, and perception.

    Examples:

        namecast Acme

        namecast Acme --mission "Industrial supply company"

        namecast --compare Acme Globex Initech
    """
    evaluator = BrandEvaluator()

    if compare and len(names) > 1:
        results = [evaluator.evaluate(name, mission) for name in names]
        if output_json:
            import json
            click.echo(json.dumps([r.to_dict() for r in results], indent=2, default=str))
        else:
            _print_comparison(results)
    else:
        for name in names:
            result = evaluator.evaluate(name, mission)
            if output_json:
                click.echo(result.to_json())
            else:
                _print_result(result, mission)


def _print_result(result, mission: str | None):
    """Print a single evaluation result with rich formatting."""
    # Header
    score_color = "green" if result.overall_score >= 70 else "yellow" if result.overall_score >= 50 else "red"
    console.print()
    console.print(Panel(
        Text(f"{result.overall_score:.0f}/100", style=f"bold {score_color}", justify="center"),
        title=f"[bold]{result.name}[/bold]",
        subtitle="Overall Score",
    ))

    # Domain table
    domain_table = Table(title="Domain Availability", show_header=True)
    domain_table.add_column("TLD")
    domain_table.add_column("Status")
    for tld, available in result.domains.items():
        status = "[green]Available[/green]" if available else "[red]Taken[/red]"
        domain_table.add_row(tld, status)
    console.print(domain_table)

    # Social table
    social_table = Table(title="Social Handles", show_header=True)
    social_table.add_column("Platform")
    social_table.add_column("Status")
    for platform, available in result.social.items():
        status = "[green]Available[/green]" if available else "[red]Taken[/red]"
        social_table.add_row(platform, status)
    console.print(social_table)

    # Trademark
    if result.trademark:
        risk_color = {"low": "green", "medium": "yellow", "high": "red"}[result.trademark.risk_level]
        console.print(f"\n[bold]Trademark Risk:[/bold] [{risk_color}]{result.trademark.risk_level.upper()}[/{risk_color}]")

    # Pronunciation
    if result.pronunciation:
        console.print(f"\n[bold]Pronunciation:[/bold] {result.pronunciation.score:.1f}/10")
        console.print(f"  Syllables: {result.pronunciation.syllables}")
        console.print(f"  Spelling: {result.pronunciation.spelling_difficulty}")

    # International
    issues = [lang for lang, data in result.international.items() if data.get("has_issue")]
    if issues:
        console.print(f"\n[bold yellow]International Issues:[/bold yellow]")
        for lang in issues:
            meaning = result.international[lang].get("meaning", "unknown issue")
            console.print(f"  {lang}: {meaning}")
    else:
        console.print(f"\n[bold green]International Check:[/bold green] No issues found")

    # Mission alignment
    if mission and result.perception and result.perception.mission_alignment:
        console.print(f"\n[bold]Mission Alignment:[/bold] {result.perception.mission_alignment:.1f}/10")

    console.print()


def _print_comparison(results):
    """Print side-by-side comparison of multiple names."""
    console.print()
    console.print("[bold]Comparison[/bold]")
    console.print()

    table = Table(show_header=True)
    table.add_column("Criteria")
    for r in results:
        table.add_column(r.name, justify="center")

    table.add_row("Overall", *[f"{r.overall_score:.0f}" for r in results])
    table.add_row("Domain", *[f"{r.domain_score:.0f}" for r in results])
    table.add_row("Social", *[f"{r.social_score:.0f}" for r in results])
    table.add_row("Trademark", *[f"{r.trademark_score:.0f}" for r in results])
    table.add_row("Pronunciation", *[f"{r.pronunciation_score:.0f}" for r in results])
    table.add_row("International", *[f"{r.international_score:.0f}" for r in results])

    console.print(table)

    # Winner
    winner = max(results, key=lambda r: r.overall_score)
    console.print(f"\n[bold green]Winner: {winner.name}[/bold green] ({winner.overall_score:.0f}/100)")
    console.print()


if __name__ == "__main__":
    main()
