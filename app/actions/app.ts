"use server";

import { getUser } from "@/lib/data-service";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const createSecretMessageAction = async (formData: FormData) => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    console.error("Error fetching user:");
    throw new Error("User not authenticated");
  }

  // Extract the message from the form data
  const message = formData.get("message") as string;

  try {
    // Insert or update the secret message
    const { data, error } = await supabase
      .from("secret_messages")
      .upsert({ user_id: user.id, message }, { onConflict: "user_id" })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error creating/updating secret message:", error.message);
    }

    console.log("Secret message created/updated successfully");
    revalidatePath("/secret-page-2");

    // Redirect to a success page or the same page
    // return redirect("/protected");
  } catch (error) {
    console.error("Error creating/updating secret message:", error);
  }
};

export const sendFriendRequestAction = async (formData: FormData) => {
  const supabase = await createClient();
  const user = await getUser();
  const friendId = formData.get("friendId") as string;

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { error } = await supabase.from("friends").insert([
      {
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      },
    ]);

    if (error) {
      throw new Error("Error sending friend request");
    }

    revalidatePath("/secret-page-3");

    console.log("Friend request sent successfully");
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
};

export const acceptFriendRequestAction = async (formData: FormData) => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const requestId = formData.get("requestId") as string;

  try {
    // Update the friend request status to 'accepted'
    const { data, error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      console.error("Error accepting friend request:", error.message);
      throw new Error("Failed to accept friend request");
    }

    revalidatePath("/secret-page-3");

    console.log("Friend request accepted successfully");
  } catch (error) {
    console.error("Caught error:", error);
  }
};
