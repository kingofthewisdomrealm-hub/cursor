import { Suspense } from "react";
import NewReservationPage from "./NewReservationClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
        </div>
      }
    >
      <NewReservationPage />
    </Suspense>
  );
}
