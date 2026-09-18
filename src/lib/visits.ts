import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";

export function getBeninDateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("fr-FR", {
    timeZone: "Africa/Porto-Novo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateString = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Porto-Novo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [hours, minutes] = timeString.split(":").map(Number);
  const currentMinutes = hours * 60 + minutes;
  const closingMinutes = 18 * 60 + 30;

  return {
    timeString,
    dateString,
    isWithinWorkingHours:
      currentMinutes >= 9 * 60 && currentMinutes < closingMinutes,
    isPastClosingTime: currentMinutes >= closingMinutes,
  };
}

export async function autoCloseExpiredVisits(
  dateString: string,
  isPastClosingTime: boolean,
) {
  await db
    .update(visits)
    .set({
      departureAt: "18:30",
      satisfactionReason: "Clôture automatique (Fin de journée)",
    })
    .where(and(isNull(visits.departureAt), lt(visits.date, dateString)));

  if (isPastClosingTime) {
    await db
      .update(visits)
      .set({
        departureAt: "18:30",
        satisfactionReason:
          "Clôture automatique (Fermeture de la bibliothèque à 18h30)",
      })
      .where(and(eq(visits.date, dateString), isNull(visits.departureAt)));
  }
}
