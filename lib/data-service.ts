import { createClient } from "@/utils/supabase/server";

export const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

export const getSecretMessage = async () => {
  const supabase = await createClient();
  const user = await getUser();

  const { data: secretMessage, error: messageError } = await supabase
    .from("secret_messages")
    .select("message")
    .eq("user_id", user?.id)
    .single();

  return secretMessage;
};

export const getAllUsers = async () => {
  const supabase = await createClient();
  const currentUser = await getUser();

  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  try {
    // Fetch all users except the current user
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email")
      .neq("id", currentUser.id); // Exclude the current user

    if (error) {
      console.error("Error fetching users:", error.message);
      throw new Error("Failed to fetch users");
    }

    return users;
  } catch (error) {
    console.error("Caught error: ", error);
    throw error;
  }
};

export const getFriendRequests = async () => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  try {
    // Fetch pending friend requests
    const { data: requests, error } = await supabase
      .from("friends")
      .select("id, user_id, profiles:user_id(email)")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching friend requests:", error.message);
    }

    return requests;
  } catch (error) {
    console.error("Caught error:", error);
    throw error;
  }
};

export const getAcceptedFriends = async () => {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  try {
    // Fetch accepted friends
    const { data: friends, error } = await supabase
      .from("friends")
      .select(
        `
        id,
        user_id,
        friend_id,
        profiles:friend_id (email),
        profiles2:user_id (email)
      `
      )
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching accepted friends:", error.message);
      throw new Error("Failed to fetch accepted friends");
    }

    // Map the results to include the friend's email and ID
    const acceptedFriends = friends.map((friend) => {
      // Determine which side of the relationship is the friend / bidirectional shit
      const isUserSender = friend.user_id === userId;
      const friendId = isUserSender ? friend.friend_id : friend.user_id;
      const friendEmail = isUserSender
        ? friend.profiles.email
        : friend.profiles2.email;

      return {
        id: friendId,
        email: friendEmail,
      };
    });

    // Fetch secret messages of friends
    const friendIds = acceptedFriends.map((friend) => friend.id);
    const { data: secretMessages, error: messagesError } = await supabase
      .from("secret_messages")
      .select("user_id, message")
      .in("user_id", friendIds);

    if (messagesError) {
      console.error("Error fetching friends' messages:", messagesError.message);
      throw new Error("Failed to fetch friends' messages");
    }

    // Combine friends with their secret messages
    const friendsWithMessages = acceptedFriends.map((friend) => {
      const message = secretMessages.find((msg) => msg.user_id === friend.id);
      return {
        ...friend,
        message: message ? message.message : "",
      };
    });

    return friendsWithMessages;
  } catch (error) {
    console.error("Caught error:", error);
    throw error;
  }
};
