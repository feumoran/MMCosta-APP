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
- Boletim detail SELECT policies must use the same assigned-role predicate as boletins and boletim_itens; unconditional authenticated reads expose details to accounts without an application role.
- Install xlsx from the official SheetJS release tarball rather than the stale npm release, so spreadsheet imports use a security-patched implementation.

- Selected private-file flows (documents, purchases, bulletins, receipts and imports) use authenticated Storage downloads and local blob previews, not signed bearer URLs, so each new fetch checks current access.
- Measurement CSV exports neutralize formula-leading text while preserving numeric cells, so shared downloads cannot execute user-supplied formulas.
- Measurement price queries use separate structured equality/null filters instead of interpolated OR syntax, so route input cannot change query meaning.
- Daily staff-cost UPDATE is restricted to administration/office; engineering retains RH reads, allocation and server-derived generation, so arbitrary direct cost edits cannot alter reports.
