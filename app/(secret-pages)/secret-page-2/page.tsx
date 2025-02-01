import { createSecretMessageAction } from "@/app/actions/app";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSecretMessage } from "@/lib/data-service";

export default async function Page() {
  const secretMessage = await getSecretMessage();
  console.log("secret massage: ", secretMessage);

  return (
    <div className="grid gap-4">
      <form className="flex-1 gap-4 flex flex-col min-w-64" action="">
        <Label className="text-xl" htmlFor="secret-message">
          Secret Message
        </Label>
        <Textarea
          className="w-96 h-20"
          name="message"
          defaultValue={secretMessage?.message}
          placeholder="Enter message here"
          id="secret-message"
        />
        <div className="flex justify-start">
          <SubmitButton
            pendingText="Submitting..."
            formAction={createSecretMessageAction}
          >
            Submit
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
