"""
Supabase Publisher for AI Researcher Pipeline

Publishes completed strategies and auto-generated blog posts to Supabase,
then triggers a Vercel rebuild.

Usage on EC2:
  Copy this file to the ai-researcher service directory.
  Add to requirements.txt: supabase, anthropic
  Add env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VERCEL_DEPLOY_HOOK

Integration:
  After a strategy passes walk-forward validation in ai-researcher, call:
    from supabase_publisher import publish_full
    publish_full(strategy_data)
"""
import os
import json
import logging
import requests

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
VERCEL_DEPLOY_HOOK = os.environ.get("VERCEL_DEPLOY_HOOK", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")


def _get_supabase():
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def publish_strategy(strategy_data: dict):
    """Insert or update a strategy in Supabase."""
    supabase = _get_supabase()
    result = supabase.table("strategies").upsert(
        strategy_data, on_conflict="slug"
    ).execute()
    logger.info(f"Published strategy: {strategy_data['slug']}")
    return result


def generate_blog_post(strategy_data: dict) -> dict:
    """Use Claude API to generate a blog post about the strategy."""
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""Write a blog post about this crypto trading strategy test.

Strategy: {strategy_data['name']}
Concept: {strategy_data.get('concept_en', '')}
Metrics: {json.dumps(strategy_data.get('metrics', {}))}
Walk-forward results: {json.dumps(strategy_data.get('walk_forward', {}))}
Status: {strategy_data.get('status', 'testing')}
Coins: {strategy_data.get('coins', [])}
Source: {strategy_data.get('source', 'unknown')}

Write in the style of a geeky researcher's personal notes. First person, casual but
technically accurate. The blog is called "Crypto Research Notes" — it's a nerd documenting
their AI-powered strategy testing journey.

Include these sections:
1. Discovery — how you found this strategy (be creative based on the source)
2. The Concept — explain how it works, technically but accessibly
3. Backtest Setup — period, coins, fees
4. Results — key metrics, mention the /lab/slug link
5. Walk-Forward Validation — out-of-sample results
6. Honest Assessment — genuinely honest pros and cons

Be truly honest about limitations. Include humor naturally (not forced).
The Korean version should NOT be a translation — write it as if a Korean nerd
wrote it natively. Different jokes, different flow.

Return valid JSON with keys:
  title_ko, title_en, description_ko, description_en, content_ko, content_en

IMPORTANT: Return ONLY the JSON, no markdown code blocks."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()

    # Handle possible markdown wrapping
    if text.startswith("```"):
        text = text.split("\n", 1)[1]  # remove first line
        text = text.rsplit("```", 1)[0]  # remove last ```

    return json.loads(text)


def publish_blog_post(strategy_data: dict, blog_data: dict):
    """Insert blog post into Supabase."""
    supabase = _get_supabase()
    post = {
        "slug": strategy_data["slug"],
        "strategy_slug": strategy_data["slug"],
        "title_ko": blog_data["title_ko"],
        "title_en": blog_data["title_en"],
        "description_ko": blog_data["description_ko"],
        "description_en": blog_data["description_en"],
        "content_ko": blog_data["content_ko"],
        "content_en": blog_data["content_en"],
        "category": "Strategy Test",
        "published_at": strategy_data.get("discovered_at"),
    }
    result = supabase.table("posts").upsert(
        post, on_conflict="slug"
    ).execute()
    logger.info(f"Published blog post: {strategy_data['slug']}")
    return result


def trigger_deploy():
    """Trigger Vercel rebuild via deploy hook."""
    if not VERCEL_DEPLOY_HOOK:
        logger.warning("No VERCEL_DEPLOY_HOOK configured, skipping deploy trigger")
        return
    try:
        resp = requests.post(VERCEL_DEPLOY_HOOK, timeout=10)
        resp.raise_for_status()
        logger.info("Triggered Vercel deploy")
    except Exception as e:
        logger.error(f"Failed to trigger deploy: {e}")


def publish_full(strategy_data: dict):
    """
    Full pipeline: publish strategy + generate blog post + trigger deploy.

    strategy_data should have at minimum:
      slug, name, status, coins, metrics, walk_forward,
      concept_en, concept_ko, source, discovered_at
    """
    try:
        publish_strategy(strategy_data)
        blog_data = generate_blog_post(strategy_data)
        publish_blog_post(strategy_data, blog_data)
        trigger_deploy()
        logger.info(f"Full publish complete: {strategy_data['slug']}")
    except Exception as e:
        logger.error(f"Publish failed for {strategy_data.get('slug', '?')}: {e}")
        raise
