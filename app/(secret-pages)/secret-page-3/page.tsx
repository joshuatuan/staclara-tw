import {
  acceptFriendRequestAction,
  sendFriendRequestAction,
} from "@/app/actions/app";
import TextExpander from "@/components/textExpander";
import { Button } from "@/components/ui/button";
import {
  getAcceptedFriends,
  getAllUsers,
  getFriendRequests,
} from "@/lib/data-service";

export default async function Page() {
  const friends = await getAcceptedFriends();
  const users = await getAllUsers();
  const friendRequests = await getFriendRequests();

  // Extract IDs of friends and pending requests
  const friendIds = friends.map((friend) => friend.id);

  // IDs of users who have sent you a friend request
  const pendingRequestIds = friendRequests?.map((request) => request.user_id);

  // Filter out friends and pending requests from the users list
  const nonFriends = users.filter(
    (user) =>
      !friendIds.includes(user.id) && !pendingRequestIds?.includes(user.id)
  );

  console.log("Non-friends:", nonFriends);
  console.log("Pending request IDs:", pendingRequestIds);

  return (
    <div className="max-w-4xl items-center flex flex-col gap-16">
      {/* Add Users Section */}
      <div className="bg-accent p-6 rounded-lg">
        {nonFriends.length === 0 ? (
          <p className="font-medium">No users available to add</p>
        ) : (
          <>
            <h2 className="text-lg font-medium mb-4">Add Users</h2>
            <ul className="flex flex-col gap-1">
              {nonFriends.map((user) => {
                const hasPendingRequest = pendingRequestIds?.includes(user.id);
                return (
                  <li
                    key={user.id}
                    className="flex gap-8 items-center justify-between p-1"
                  >
                    <p className="">{user.email}</p>
                    <form action={sendFriendRequestAction}>
                      <input type="hidden" name="friendId" value={user.id} />
                      <Button
                        size="sm"
                        type="submit"
                        variant="outline"
                        disabled={hasPendingRequest}
                        className="font-semibold text-sm"
                      >
                        Add
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Friends & Friend Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-accent p-8 rounded-lg ">
          <h2 className="text-lg font-medium mb-4">
            Friend Requests <span>({friendRequests?.length})</span>
          </h2>

          {friendRequests && friendRequests.length > 0 ? (
            <ul className="space-y-3">
              {friendRequests?.map((request) => (
                <li
                  key={request.id}
                  className="flex justify-between gap-3 items-center"
                >
                  <p>{request.profiles.email}</p>
                  <form action={acceptFriendRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <Button
                      size="sm"
                      type="submit"
                      variant="outline"
                      className="font-semibold text-sm"
                    >
                      Accept
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending friend requests.</p>
          )}
        </div>

        {/* Friends list*/}
        <div className="bg-accent p-8 rounded-lg ">
          <h2 className="text-lg font-medium mb-4">
            Friends <span>({friends?.length})</span>
          </h2>
          {friends.length > 0 ? (
            <ul className="space-y-3">
              {friends.map((friend) => (
                <li key={friend.id} className="p-1">
                  <p>{friend.email}</p>
                  {friend.message && friend.message.length > 1 && (
                    <p className="text-sm mt-1">
                      <span>Secret Message:</span>{" "}
                      {
                        <TextExpander maxWords={10}>
                          {friend.message}
                        </TextExpander>
                      }
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
