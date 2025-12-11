# Script pour retirer AdminLayout de toutes les nouvelles pages

$files = @(
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Utilisateurs/ListeUtilisateurs.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Utilisateurs/Roles.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Logs.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Parametres/General.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Support/Tickets.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Marketing/Newsletter.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/CMS/Pages.vue",
    "C:/wamp64/www/Gadget/gadgetzone_admin/src/views/Integrations/Apps.vue"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Retirer <AdminLayout> et </AdminLayout>
        $content = $content -replace '<AdminLayout>\s*\r?\n\s*', ''
        $content = $content -replace '\s*</AdminLayout>\s*\r?\n', "`r`n"
        
        # Retirer l'import AdminLayout
        $content = $content -replace "import AdminLayout from '@/components/layout/AdminLayout\.vue';\s*\r?\n", ''
        
        # Sauvegarder
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✓ Fixed: $file"
    }
}

Write-Host "`n✅ All files fixed!"
