import { deleteAccountAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getSecretMessage, getUser } from "@/lib/data-service";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const secretMessage = await getSecretMessage();
  console.log("secret massage: ", secretMessage?.message);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {secretMessage && (
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            {`Secret Message: ${secretMessage?.message}`}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-10 items-start">
        <div>
          <h2 className="font-bold text-2xl mb-4">Your user details</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div className="flex gap-4">
          <Link className="text-primary underline" href="/secret-page-2">
            secret-page-2
          </Link>
          <Link className="text-primary underline" href="/secret-page-3">
            secret-page-3
          </Link>
        </div>
        <div>
          <form action={deleteAccountAction}>
            <Button type="submit">Delete Account</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
