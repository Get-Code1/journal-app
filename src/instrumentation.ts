export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedIfEmpty } = await import("@/lib/seed");
    seedIfEmpty();
  }
}
