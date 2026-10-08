<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Authentication emails use the managed `/lovable/email/auth/*` routes and shared MMcosta templates, because delivery and branding must remain consistent.
- Obra status is synchronized from its latest physical progress mark in the database, so 100% completion stays consistent across every screen.
- Employee vacation tracking uses ferias_limite; retain deprecated ferias_inicio and ferias_fim columns for backward compatibility and to avoid destructive schema changes.
