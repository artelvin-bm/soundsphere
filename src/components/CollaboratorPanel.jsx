import { useEffect, useState } from "react";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { api } from "../services/api";

function CollaboratorPanel({
  project,
  currentUser,
  showMessage,
  openConfirmDialog,
  onCollaboratorsChange,
}) {
  const [collaborators, setCollaborators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const isOwner = project.ownerId === currentUser.id;

  async function loadCollaborators() {
    if (!project) return;

    try {
      const data = await api.getCollaborators(project.id);
      setCollaborators(data);
    } catch (error) {
      showMessage(error.message);
    }
  }

  useEffect(() => {
    loadCollaborators();
    setSearchQuery("");
    setSearchResults([]);
  }, [project.id]);

  useEffect(() => {
    if (!isOwner) return;

    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchDelay = setTimeout(async () => {
      try {
        setIsSearching(true);

        const users = await api.searchUsers(trimmedQuery, currentUser.id);
        const collaboratorIds = collaborators.map((item) => item.userId);

        const filteredUsers = users.filter(
          (user) =>
            user.id !== project.ownerId &&
            !collaboratorIds.includes(user.id)
        );

        setSearchResults(filteredUsers);
      } catch (error) {
        showMessage(error.message);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(searchDelay);
  }, [searchQuery, collaborators, currentUser.id, isOwner, project.ownerId]);

  async function addCollaborator(userId) {
    try {
      const addedCollaborator = await api.addCollaborator(project.id, userId);

      setCollaborators([...collaborators, addedCollaborator]);
      setSearchResults(searchResults.filter((user) => user.id !== userId));
      setSearchQuery("");

      showMessage("Collaborator added.");
      onCollaboratorsChange?.();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function removeCollaborator(userId) {
    try {
      await api.removeCollaborator(project.id, userId);

      setCollaborators(
        collaborators.filter((item) => item.userId !== userId)
      );

      showMessage("Collaborator removed.");
      onCollaboratorsChange?.();
    } catch (error) {
      showMessage(error.message);
    }
  }

  return (
    <div className="card collaborator-card">
      <div className="section-header">
        <h2>
          <Users size={20} />
          Collaborators
        </h2>
      </div>

      <div className="owner-row">
        <div>
          <h3>{project.ownerName || currentUser.name}</h3>
          <p>{project.ownerEmail || currentUser.email} • Owner</p>
        </div>
      </div>

      {isOwner ? (
        <div className="suggestion-search">
          <div className="suggestion-input-wrap">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search registered users by name or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <p className="suggestion-hint">
              Type at least 2 characters to search.
            </p>
          )}

          {isSearching && (
            <p className="suggestion-hint">Searching users...</p>
          )}

          {searchQuery.trim().length >= 2 &&
            !isSearching &&
            searchResults.length === 0 && (
              <p className="suggestion-hint">No matching users found.</p>
            )}

          {searchResults.length > 0 && (
            <div className="suggestion-list">
              {searchResults.map((user) => (
                <button
                  type="button"
                  className="suggestion-item"
                  key={user.id}
                  onClick={() => addCollaborator(user.id)}
                >
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>

                  <span>
                    <UserPlus size={16} />
                    Add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="empty-text">
          Only the project owner can add or remove collaborators.
        </p>
      )}

      <div className="collaborator-list">
        {collaborators.length === 0 && (
          <p className="empty-text">No collaborators added yet.</p>
        )}

        {collaborators.map((collaborator) => (
          <div className="collaborator-row" key={collaborator.userId}>
            <div>
              <h3>{collaborator.name}</h3>
              <p>{collaborator.email} • {collaborator.role}</p>
            </div>

            {isOwner && (
              <button
                type="button"
                className="small-danger-button"
                onClick={() =>
                  openConfirmDialog({
                    title: "Remove collaborator?",
                    message:
                      "This user will lose access to the shared project.",
                    confirmText: "Remove",
                    onConfirm: () =>
                      removeCollaborator(collaborator.userId),
                  })
                }
                title="Remove collaborator"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollaboratorPanel;