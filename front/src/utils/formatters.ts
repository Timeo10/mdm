/**
 * Formate un SIREN en ajoutant des espaces tous les 3 chiffres
 * Exemple: "123456789" => "123 456 789"
 */
export function formatSiren(siren: string | undefined | null): string {
  if (!siren) return '';

  // Retire tous les caractères non numériques
  const cleaned = siren.replace(/\D/g, '');

  // Ajoute des espaces tous les 3 chiffres
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

/**
 * Retire le formatage d'un SIREN (enlève les espaces)
 * Exemple: "123 456 789" => "123456789"
 */
export function unformatSiren(siren: string): string {
  return siren.replace(/\s/g, '');
}

/**
 * Formate un SIRET en ajoutant des espaces (3-3-3-5)
 * Exemple: "12345678901234" => "123 456 789 01234"
 */
export function formatSiret(siret: string | undefined | null): string {
  if (!siret) return '';

  // Retire tous les caractères non numériques
  const cleaned = siret.replace(/\D/g, '');

  // Ajoute des espaces selon le format 3-3-3-5
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
}

/**
 * Retire le formatage d'un SIRET (enlève les espaces)
 * Exemple: "123 456 789 01234" => "12345678901234"
 */
export function unformatSiret(siret: string): string {
  return siret.replace(/\s/g, '');
}
