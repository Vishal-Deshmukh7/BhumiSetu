export function getRiskScoreBadge(score) {
  const normalizedScore = Number(score)

  if (normalizedScore >= 87) {
    return {
      label: 'Low Risk / Healthy Progress',
      shortLabel: 'Low Risk',
      badgeClass: 'bg-green-100 text-green-900',
      panelClass: 'from-green-50 to-emerald-50 border-green-200',
      textClass: 'text-green-600',
    }
  }

  if (normalizedScore >= 70) {
    return {
      label: 'Moderate Risk / Needs Monitoring',
      shortLabel: 'Moderate Risk',
      badgeClass: 'bg-yellow-100 text-yellow-900',
      panelClass: 'from-yellow-50 to-amber-50 border-yellow-200',
      textClass: 'text-amber-600',
    }
  }

  if (normalizedScore >= 60) {
    return {
      label: 'Elevated Risk / Action Recommended',
      shortLabel: 'Elevated Risk',
      badgeClass: 'bg-gray-200 text-gray-900',
      panelClass: 'from-gray-50 to-slate-100 border-gray-300',
      textClass: 'text-gray-600',
    }
  }

  return {
    label: 'High Risk / Critical Action Required',
    shortLabel: 'High Risk',
    badgeClass: 'bg-red-100 text-red-900',
    panelClass: 'from-red-50 to-orange-50 border-red-200',
    textClass: 'text-red-600',
  }
}
