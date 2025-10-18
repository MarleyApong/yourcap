import { useTranslation } from '@/shared/i18n';

// Script de test pour démontrer la type-safety
export function testTranslations() {
  const { t } = useTranslation();

  // ✅ Clés valides - pas d'erreur TypeScript
  console.log(t("auth.login.email"));
  console.log(t("auth.login.password"));
  console.log(t("common.error"));

  // ❌ Clés invalides - erreurs TypeScript
  // console.log(t("auth.login.invalidKey"));
  // console.log(t("nonexistent.key"));
  // console.log(t("auth.register.fakeField"));

  console.log("✅ Test des traductions terminé");
}
