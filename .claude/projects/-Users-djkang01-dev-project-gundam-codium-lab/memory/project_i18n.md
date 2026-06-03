---
name: project-i18n-implementation
description: i18n (ko/en) was implemented using Next.js 16 [lang] segment pattern — all pages moved under app/[lang]/(site)/
metadata:
  type: project
---

i18n multilingual support was implemented (Korean + English) using Next.js 16 App Router's [lang] dynamic segment approach.

**Why:** User requested multilingual support for all pages.

**How to apply:** When working on pages or components, note that all pages are now under `app/[lang]/(site)/` and `app/[lang]/(auth)/`. Content is in `dictionaries/ko.json` and `dictionaries/en.json`. The getDictionary function is at `app/[lang]/dictionaries.ts`. Components (Hero, Services, Process, FAQ, Footer, Nav, NavLinks, InquiryForm) now accept `dict` and/or `lang` props instead of importing from lib/brand.ts directly.

**Pending cleanup:** `middleware.ts` in the project root is a leftover untracked file that conflicts with the new `proxy.ts`. The user needs to delete it manually: `rm middleware.ts`.
