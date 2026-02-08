"""Modal deployment for the Namecast API."""

import modal

app = modal.App("namecast-api")

image = (
    modal.Image.debian_slim(python_version="3.12")
    .add_local_dir(".", remote_path="/root/namecast-repo", copy=True)
    .run_commands("cd /root/namecast-repo && pip install -e .")
)


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("anthropic-api-key"),
        modal.Secret.from_name("namecast-api-password"),
    ],
    timeout=300,
)
@modal.asgi_app()
def api():
    from namecast.api import app as fastapi_app
    return fastapi_app
