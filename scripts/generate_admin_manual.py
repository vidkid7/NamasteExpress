from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
PDF_PATH = OUT_DIR / "admin-panel-user-manual.pdf"
LOGO = ROOT / "public" / "icons" / "logo.jpeg"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 0.58 * inch
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

RED = colors.HexColor("#c62828")
DARK = colors.HexColor("#171717")
MUTED = colors.HexColor("#667085")
LIGHT = colors.HexColor("#f7f7f8")
BORDER = colors.HexColor("#dedee3")
GREEN = colors.HexColor("#16a34a")
BLUE = colors.HexColor("#2563eb")
AMBER = colors.HexColor("#d97706")


def register_fonts():
    arial = Path("C:/Windows/Fonts/arial.ttf")
    arial_bold = Path("C:/Windows/Fonts/arialbd.ttf")
    if arial.exists():
        pdfmetrics.registerFont(TTFont("Manual", str(arial)))
    if arial_bold.exists():
        pdfmetrics.registerFont(TTFont("Manual-Bold", str(arial_bold)))


def styles():
    register_fonts()
    base = getSampleStyleSheet()
    base.add(
        ParagraphStyle(
            "ManualTitle",
            parent=base["Title"],
            fontName="Manual-Bold",
            fontSize=28,
            leading=34,
            alignment=TA_CENTER,
            textColor=DARK,
            spaceAfter=12,
        )
    )
    base.add(
        ParagraphStyle(
            "ManualSubtitle",
            parent=base["BodyText"],
            fontName="Manual",
            fontSize=11,
            leading=16,
            alignment=TA_CENTER,
            textColor=MUTED,
            spaceAfter=14,
        )
    )
    base.add(
        ParagraphStyle(
            "H1Manual",
            parent=base["Heading1"],
            fontName="Manual-Bold",
            fontSize=19,
            leading=23,
            textColor=DARK,
            spaceBefore=6,
            spaceAfter=12,
        )
    )
    base.add(
        ParagraphStyle(
            "H2Manual",
            parent=base["Heading2"],
            fontName="Manual-Bold",
            fontSize=13,
            leading=17,
            textColor=DARK,
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    base.add(
        ParagraphStyle(
            "BodyManual",
            parent=base["BodyText"],
            fontName="Manual",
            fontSize=9.5,
            leading=14,
            textColor=DARK,
            spaceAfter=6,
        )
    )
    base.add(
        ParagraphStyle(
            "SmallManual",
            parent=base["BodyText"],
            fontName="Manual",
            fontSize=8,
            leading=11,
            textColor=MUTED,
        )
    )
    base.add(
        ParagraphStyle(
            "Cell",
            parent=base["BodyText"],
            fontName="Manual",
            fontSize=7.7,
            leading=10,
            textColor=DARK,
        )
    )
    base.add(
        ParagraphStyle(
            "CellBold",
            parent=base["BodyText"],
            fontName="Manual-Bold",
            fontSize=7.7,
            leading=10,
            textColor=DARK,
        )
    )
    base.add(
        ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName="Manual-Bold",
            fontSize=9,
            leading=13,
            textColor=colors.white,
        )
    )
    return base


S = styles()


def p(text, style="BodyManual"):
    return Paragraph(text, S[style])


def bullets(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=10) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="Manual",
        bulletFontSize=6,
    )


def make_table(data, widths=None, header=True):
    converted = []
    for row_index, row in enumerate(data):
        style_name = "CellBold" if header and row_index == 0 else "Cell"
        converted.append([p(str(cell), style_name) for cell in row])
    table = Table(converted, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        style.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("TEXTCOLOR", (0, 0), (-1, 0), DARK),
            ]
        )
    table.setStyle(TableStyle(style))
    return table


def callout(title, body, color=RED):
    return Table(
        [[p(title, "Callout"), p(body, "Callout")]],
        colWidths=[1.65 * inch, CONTENT_WIDTH - 1.65 * inch],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), color),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ],
    )


def flow_chart(steps, color=BLUE):
    cols = []
    widths = []
    box_width = min(1.2 * inch, (CONTENT_WIDTH - (len(steps) - 1) * 0.22 * inch) / len(steps))
    for i, step in enumerate(steps):
        cols.append(
            Table(
                [[p(step[0], "CellBold")], [p(step[1], "Cell")]],
                colWidths=[box_width],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                    ("BOX", (0, 0), (-1, -1), 0.8, color),
                    ("LINEBELOW", (0, 0), (-1, 0), 0.6, color),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ],
            )
        )
        widths.append(box_width)
        if i < len(steps) - 1:
            cols.append(p("->", "H2Manual"))
            widths.append(0.22 * inch)
    return Table([cols], colWidths=widths, style=[("VALIGN", (0, 0), (-1, -1), "MIDDLE")])


def feature_card(title, items):
    return Table(
        [[p(title, "CellBold")], [bullets(items)]],
        colWidths=[CONTENT_WIDTH],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, RED),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ],
    )


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.line(MARGIN, PAGE_HEIGHT - 0.42 * inch, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 0.42 * inch)
    canvas.setFont("Manual", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 0.3 * inch, "Admin Panel User Manual")
    canvas.drawRightString(PAGE_WIDTH - MARGIN, 0.3 * inch, f"Page {doc.page}")
    canvas.restoreState()


def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#fff7f7"))
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=True, stroke=False)
    canvas.setFillColor(RED)
    canvas.rect(0, PAGE_HEIGHT - 1.25 * inch, PAGE_WIDTH, 1.25 * inch, fill=True, stroke=False)
    canvas.restoreState()


def build_story():
    story = []
    story.append(NextPageTemplate("normal"))
    if LOGO.exists():
        logo = Image(str(LOGO), width=1.1 * inch, height=1.1 * inch)
        logo.hAlign = "CENTER"
        story.append(Spacer(1, 0.5 * inch))
        story.append(logo)
    else:
        story.append(Spacer(1, 1.1 * inch))
    story.append(Spacer(1, 0.25 * inch))
    story.append(p("Admin Panel User Manual", "ManualTitle"))
    story.append(p("How to run, manage, and troubleshoot the NamasteExpress news admin panel", "ManualSubtitle"))
    story.append(callout("Current Upload Mode", "Cloudinary is enabled with STORAGE_PROVIDER=cloudinary. Uploaded media should return a res.cloudinary.com URL.", BLUE))
    story.append(Spacer(1, 0.25 * inch))
    story.append(
        make_table(
            [
                ["Project", "News portal admin panel"],
                ["Local URL", "http://localhost:3000/admin"],
                ["Default local admin", "admin@namastexpress.com / Admin@12345 after seeding"],
                ["Roles", "Admin, Editor, Author"],
                ["Generated", "2026-06-27"],
            ],
            widths=[1.7 * inch, CONTENT_WIDTH - 1.7 * inch],
            header=False,
        )
    )
    story.append(PageBreak())

    story.append(p("1. Quick Start", "H1Manual"))
    story.append(p("Use this section when starting the project from a fresh checkout or after changing environment variables.", "BodyManual"))
    story.append(
        make_table(
            [
                ["Step", "Command or action", "Expected result"],
                ["Install packages", "npm install", "Node dependencies and Prisma client are installed."],
                ["Prepare database", "npx prisma db push", "The PostgreSQL schema matches prisma/schema.prisma."],
                ["Seed data", "npx prisma db seed", "Admin, editor, author, categories, sample articles, and settings are created."],
                ["Run app", "npm run dev", "Next.js starts at http://localhost:3000."],
                ["Open admin", "Visit /admin and log in", "Dashboard and sidebar appear after authentication."],
            ],
            widths=[1.15 * inch, 2.2 * inch, CONTENT_WIDTH - 3.35 * inch],
        )
    )
    story.append(Spacer(1, 10))
    story.append(flow_chart([("Start", "npm run dev"), ("Login", "/auth/login"), ("Dashboard", "/admin"), ("Manage", "Use sidebar modules"), ("Verify", "Preview site")], GREEN))
    story.append(Spacer(1, 10))
    story.append(callout("After changing .env", "Restart the dev server. Next.js can reload env text, but storage provider singletons may stay in memory until restart.", AMBER))
    story.append(PageBreak())

    story.append(p("2. Login, Roles, and Access", "H1Manual"))
    story.append(p("The admin layout requires an authenticated user with ADMIN, EDITOR, or AUTHOR role. Users without the required role are redirected away from admin pages.", "BodyManual"))
    story.append(
        make_table(
            [
                ["Role", "Allowed areas", "Typical responsibility"],
                ["Admin", "All admin modules", "Full site control, settings, users, ads, audit log, delete operations."],
                ["Editor", "Editorial and data modules", "Articles, categories, tags, comments, media, sports, reels, galleries, finance and calendar data."],
                ["Author", "Limited content modules", "Articles and media work where permitted."],
            ],
            widths=[1.0 * inch, 2.5 * inch, CONTENT_WIDTH - 3.5 * inch],
        )
    )
    story.append(Spacer(1, 10))
    story.append(p("Login workflow", "H2Manual"))
    story.append(flow_chart([("Credentials", "Email and password"), ("Auth", "NextAuth credentials provider"), ("Role check", "requireRole"), ("Admin UI", "Sidebar filtered by role")], BLUE))
    story.append(PageBreak())

    story.append(p("3. Admin Navigation Map", "H1Manual"))
    nav = [
        ["Dashboard", "Summary metrics and quick links."],
        ["Articles", "Create, edit, publish, archive, delete, tag, categorize, and upload featured images."],
        ["Categories", "Create, edit, activate/deactivate, and delete empty categories."],
        ["Tags", "Create, edit, and delete tags."],
        ["Comments", "Search, filter, approve, reject, or mark comments."],
        ["Media", "Upload files to Cloudinary, add remote image URLs, edit alt text, delete media."],
        ["Ads", "Create ad positions and manage ad records with image upload."],
        ["Sports", "Create tournaments, create matches, update scores and status."],
        ["Reels", "Create reels, upload thumbnail images, edit video URL/status, delete reels."],
        ["Galleries", "Create galleries, upload cover images, edit status, delete galleries."],
        ["Breaking News", "Create, edit, activate/deactivate, and delete ticker items."],
        ["Finance and Patro", "Manage holidays, gold/silver prices, forex rates, and rashifal."],
        ["Settings", "Update logo, site name, colors, contact, social links, features."],
    ]
    story.append(make_table([["Module", "Use"]] + nav, widths=[1.55 * inch, CONTENT_WIDTH - 1.55 * inch]))
    story.append(PageBreak())

    story.append(p("4. Dashboard", "H1Manual"))
    story.append(feature_card("What to check first", [
        "Total articles, views, comments, ads, users, tags, and categories.",
        "Today activity cards for published articles, page views, new users, and pending comments.",
        "Quick links for viewing the public site or creating a new article.",
        "Recent audit and activity indicators when available.",
    ]))
    story.append(Spacer(1, 10))
    story.append(p("Operational habit", "H2Manual"))
    story.append(bullets([
        "Open Dashboard after logging in to confirm the site and database are responding.",
        "Use the sidebar to move between modules. Admin language labels can be toggled from the sidebar header.",
        "Use Back to site to verify public-facing changes after publishing.",
    ]))
    story.append(PageBreak())

    story.append(p("5. Articles", "H1Manual"))
    story.append(p("Articles are the main editorial workflow. The admin supports creating, editing, deleting, publishing, archiving, featured placement, category selection, tags, Nepali and English fields, AI summary text, and featured image upload.", "BodyManual"))
    story.append(
        make_table(
            [
                ["Task", "Where", "Steps"],
                ["Create article", "Articles -> + New Article", "Fill title, slug, content, category, status, tags, image URL or upload image, then save."],
                ["Edit article", "Articles -> Edit", "Update fields, upload a new featured image if needed, save changes."],
                ["Publish", "Status field", "Change status from DRAFT to PUBLISHED and save."],
                ["Feature article", "Featured checkbox", "Enable Featured and save. Featured stories appear in prominent front-page areas."],
                ["Delete", "Edit article page", "Use Delete Article. This cannot be undone."],
            ],
            widths=[1.35 * inch, 1.55 * inch, CONTENT_WIDTH - 2.9 * inch],
        )
    )
    story.append(Spacer(1, 10))
    story.append(flow_chart([("Draft", "Write content"), ("Media", "Upload featured image"), ("Meta", "Category and tags"), ("Review", "Preview text"), ("Publish", "Set PUBLISHED")], RED))
    story.append(PageBreak())

    story.append(p("6. Media and Cloudinary Uploads", "H1Manual"))
    story.append(callout("Verified", "A live admin upload returned a Cloudinary URL under namastexpress/images and stored cloudinary_public_id metadata.", GREEN))
    story.append(
        make_table(
            [
                ["Action", "How to use it", "Notes"],
                ["Upload file", "Admin -> Media -> Upload File", "Supports image, video, and PDF files up to 10 MB."],
                ["Add by URL", "Paste a public image URL", "Only public http/https image URLs are accepted."],
                ["Edit alt text", "Media item -> Edit", "Use clear alt text for SEO and accessibility."],
                ["Delete file", "Media item -> Del", "Admin role required for delete. Cloudinary files use public ID metadata."],
                ["Use in articles", "Copy returned URL or use upload button in article forms", "New and edit article pages can upload featured images."],
            ],
            widths=[1.25 * inch, 2.1 * inch, CONTENT_WIDTH - 3.35 * inch],
        )
    )
    story.append(Spacer(1, 10))
    story.append(p("Cloudinary configuration checklist", "H2Manual"))
    story.append(bullets([
        "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        "Set STORAGE_PROVIDER=cloudinary.",
        "Restart npm run dev or redeploy the server after env changes.",
        "Upload a small image and confirm the saved URL starts with https://res.cloudinary.com/.",
    ]))
    story.append(PageBreak())

    story.append(p("7. Categories and Tags", "H1Manual"))
    story.append(
        make_table(
            [
                ["Area", "Create", "Edit", "Delete", "Important rule"],
                ["Categories", "Name, English name, slug, color, sort order", "Inline form updates name, slug, color, sort, active status", "Delete only empty categories", "Do not delete categories containing articles or child categories."],
                ["Tags", "Name and English name", "Inline edit name and English name", "Delete from tag table", "Slug is generated from the tag name."],
            ],
            widths=[1.1 * inch, 1.55 * inch, 1.7 * inch, 1.15 * inch, CONTENT_WIDTH - 5.5 * inch],
        )
    )
    story.append(Spacer(1, 10))
    story.append(p("Editorial guidance", "H2Manual"))
    story.append(bullets([
        "Keep category slugs stable once public articles use them.",
        "Use sort order to control category display order.",
        "Use tags for topics such as breaking, analysis, politics, economy, sports, and technology.",
    ]))
    story.append(PageBreak())

    story.append(p("8. Comments, Users, Newsletter, and Audit Log", "H1Manual"))
    story.append(make_table([
        ["Module", "Available workflow"],
        ["Comments", "Filter comments, review content, approve, reject, mark spam, or delete according to moderation rules."],
        ["Users", "Admin can view users and update user roles. Use this carefully because role controls admin access."],
        ["Newsletter", "View newsletter subscribers and active status information."],
        ["Audit Log", "Search and filter CREATE, UPDATE, DELETE actions. Use this to trace admin changes."],
    ], widths=[1.45 * inch, CONTENT_WIDTH - 1.45 * inch]))
    story.append(PageBreak())

    story.append(p("9. Ads, Sports, Reels, and Galleries", "H1Manual"))
    story.append(make_table([
        ["Module", "Create", "Edit", "Delete"],
        ["Ads", "Create ad positions and ad records; upload or paste ad image URL.", "Toggle active status and update ad metadata.", "Delete ad records."],
        ["Sports", "Create tournaments and matches.", "Update scores, status, venue, and match date.", "Delete endpoint is not exposed for matches in the current UI."],
        ["Reels", "Create with title, slug, video URL, thumbnail upload, description.", "Edit title, video URL, thumbnail URL, active status.", "Delete reels."],
        ["Galleries", "Create with title, slug, description, cover image upload.", "Edit title and active status.", "Delete galleries."],
    ], widths=[1.15 * inch, 2.05 * inch, 2.05 * inch, CONTENT_WIDTH - 5.25 * inch]))
    story.append(PageBreak())

    story.append(p("10. Breaking News", "H1Manual"))
    story.append(p("Breaking news controls the ticker-style urgent news items. Items can optionally link to an article by article ID and can expire automatically.", "BodyManual"))
    story.append(flow_chart([("Create", "Title and optional article ID"), ("Schedule", "Optional expiry date"), ("Activate", "Shown in ticker"), ("Edit", "Change fields"), ("Delete", "Remove old item")], AMBER))
    story.append(Spacer(1, 10))
    story.append(make_table([
        ["Field", "Meaning"],
        ["Title", "Text shown in the breaking news area."],
        ["Article ID", "Optional relation to an article. Leave blank for text-only breaking news."],
        ["Expires At", "When set, item stops being active after that date/time."],
        ["Active", "Manual on/off control."],
    ], widths=[1.5 * inch, CONTENT_WIDTH - 1.5 * inch]))
    story.append(PageBreak())

    story.append(p("11. Calendar and Finance Data", "H1Manual"))
    story.append(make_table([
        ["Module", "Purpose", "CRUD now available"],
        ["Holidays", "Public, cultural, restricted, and observance dates for Patro.", "Create, edit, delete."],
        ["Gold/Silver", "Daily fine gold, tejabi gold, and silver prices.", "Create, edit, delete."],
        ["Forex", "Daily buy/sell exchange rates by currency.", "Create, edit, delete."],
        ["Rashifal", "Daily horoscope predictions by sign.", "Create, edit, delete."],
    ], widths=[1.25 * inch, 2.55 * inch, CONTENT_WIDTH - 3.8 * inch]))
    story.append(Spacer(1, 10))
    story.append(p("Data quality checks", "H2Manual"))
    story.append(bullets([
        "Use correct AD dates because public pages group and sort by date.",
        "Keep currency codes uppercase, such as USD, EUR, GBP.",
        "For rashifal, keep rating between 1 and 5.",
        "After saving, open the matching public Patro or finance page to verify display.",
    ]))
    story.append(PageBreak())

    story.append(p("12. Settings", "H1Manual"))
    story.append(make_table([
        ["Setting group", "Fields"],
        ["Identity", "Site name, tagline, logo URL or logo upload, favicon."],
        ["Brand", "Primary color and visual identity values."],
        ["Contact", "Phone, email, address, registration number."],
        ["Social", "Facebook, Twitter/X, YouTube, Instagram, TikTok links."],
        ["Features", "Comments, bookmarks, reels, galleries feature toggles."],
    ], widths=[1.35 * inch, CONTENT_WIDTH - 1.35 * inch]))
    story.append(Spacer(1, 10))
    story.append(callout("Logo uploads", "The settings page uses the same /api/v1/media upload endpoint, so Cloudinary must be configured before uploading the logo.", BLUE))
    story.append(PageBreak())

    story.append(p("13. Troubleshooting", "H1Manual"))
    story.append(make_table([
        ["Problem", "Likely cause", "Fix"],
        ["Upload returns /uploads instead of Cloudinary", "STORAGE_PROVIDER is local or server was not restarted.", "Set STORAGE_PROVIDER=cloudinary and restart the server."],
        ["Upload fails with 401", "Not logged in or session expired.", "Log in again as Admin, Editor, or Author."],
        ["Upload fails with 403", "Role does not allow upload.", "Use Admin, Editor, or Author account."],
        ["Upload fails with 400", "File type or size rejected.", "Use jpg, png, gif, webp, avif, mp4, webm, or pdf under 10 MB."],
        ["Upload fails with 500", "Cloudinary credentials or provider error.", "Check Cloudinary env names and redeploy/restart."],
        ["Delete category fails", "Category still has articles or children.", "Move articles first or deactivate the category instead."],
        ["Admin page slow locally", "Remote database latency.", "Wait for data, check the PostgreSQL connection, or use a local database for development."],
    ], widths=[1.85 * inch, 2.0 * inch, CONTENT_WIDTH - 3.85 * inch]))
    story.append(PageBreak())

    story.append(p("14. Final Admin Workflow Checklist", "H1Manual"))
    story.append(make_table([
        ["Before publishing", "Check"],
        ["Content", "Title, slug, excerpt, article body, category, tags, featured image."],
        ["Media", "Image loads from Cloudinary or a public URL; alt text is meaningful."],
        ["SEO", "Excerpt and summary are readable; title is clear."],
        ["Status", "Draft until reviewed; Published only when ready."],
        ["Public preview", "Open article, category page, homepage, and related widgets."],
        ["Audit", "Check audit log for important create/update/delete actions."],
    ], widths=[1.8 * inch, CONTENT_WIDTH - 1.8 * inch]))
    story.append(Spacer(1, 12))
    story.append(callout("Recommended routine", "Create -> upload media -> save draft -> review -> publish -> verify public page -> check analytics/audit if needed.", GREEN))
    return story


def build_pdf():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frame = Frame(MARGIN, MARGIN, CONTENT_WIDTH, PAGE_HEIGHT - 2 * MARGIN, id="normal")
    doc = BaseDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=MARGIN,
        leftMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title="Admin Panel User Manual",
        author="Codex",
    )
    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[frame], onPage=cover),
            PageTemplate(id="normal", frames=[frame], onPage=header_footer),
        ]
    )
    doc.build(build_story())
    print(PDF_PATH)


if __name__ == "__main__":
    build_pdf()
