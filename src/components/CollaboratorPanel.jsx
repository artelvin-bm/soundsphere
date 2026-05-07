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

  async function searchUsers(event) {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const users = await api.searchUsers(searchQuery, currentUser.id);

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
  }

  async function addCollaborator(userId) {
    try {
      const addedCollaborator = await api.addCollaborator(project.id, userId);
      setCollaborators([...collaborators, addedCollaborator]);
      setSearchResults(searchResults.filter((user) => user.id !== userId));
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
          <h3>{currentUser.id === project.ownerId ? currentUser.name : "Project Owner"}</h3>
          <p>Owner</p>
        </div>
      </div>

      {isOwner ? (
        <form className="collaborator-search" onSubmit={searchUsers}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <button type="submit" className="primary-button">
            <Search size={16} />
            Search
          </button>
        </form>
      ) : (
        <p className="empty-text">
          Only the project owner can add or remove collaborators.
        </p>
      )}

      {isSearching && <p className="empty-text">Searching users...</p>}

      {searchResults.length > 0 && (
        <div className="collaborator-results">
          {searchResults.map((user) => (
            <div className="collaborator-row" key={user.id}>
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>

              <button
                type="button"
                className="small-edit-button"
                onClick={() => addCollaborator(user.id)}
                title="Add collaborator"
              >
                <UserPlus size={16} />
              </button>
            </div>
          ))}
        </div>
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