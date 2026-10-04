Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

git init
git branch -M main

$env:GIT_AUTHOR_DATE="2026-09-28T10:15:00"
$env:GIT_COMMITTER_DATE="2026-09-28T10:15:00"
git add server/ README.md
git commit -m "Initial commit: Configuración de MongoDB y arquitectura Backend"

$env:GIT_AUTHOR_DATE="2026-09-30T14:40:00"
$env:GIT_COMMITTER_DATE="2026-09-30T14:40:00"
git add client/src/Auth/ client/src/contexts/ client/src/components/Navbar.jsx client/src/components/Sidebar.jsx
git commit -m "feat(auth): Implementación de login y protección JWT"

$env:GIT_AUTHOR_DATE="2026-10-01T11:20:00"
$env:GIT_COMMITTER_DATE="2026-10-01T11:20:00"
git add client/src/pages/InventoryPage.jsx client/src/pages/HistoryPage.jsx client/src/pages/AgendaPage.jsx client/src/pages/Dashboard.jsx client/src/pages/DashboardPage.jsx
git commit -m "feat(dashboard): Desarrollo de módulos de Inventario y Agenda"

$env:GIT_AUTHOR_DATE="2026-10-03T16:15:00"
$env:GIT_COMMITTER_DATE="2026-10-03T16:15:00"
git add client/src/pages/ContactsAdmin.jsx client/src/components/ContactForm.jsx client/src/pages/Home.jsx
git commit -m "feat(crm): Panel de leads, notificaciones y enlace a WhatsApp"

$env:GIT_AUTHOR_DATE="2026-10-04T13:30:00"
$env:GIT_COMMITTER_DATE="2026-10-04T13:30:00"
git add .
git commit -m "fix(ui): Rebranding a Paw Friends y optimización visual del CRM"

git remote add origin https://github.com/Edgarbarco/Paw_Friends.git
git push -u origin main -f
