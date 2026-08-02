import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTierListDialog } from './components/CreateDialogs';
import { useTierLists } from './hooks/useTierLists';

function HomePage() {
    const navigate = useNavigate();
    const { tierLists, isLoading, error, createTierList, uploadImage, deleteTierList } = useTierLists();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createDialogVersion, setCreateDialogVersion] = useState(0);

    const handleCreateNewList = useCallback(async (payload: Parameters<typeof createTierList>[0]) => {
        try {
            const createdList = await createTierList(payload);
            navigate(`/edit/${createdList.id}`);
        } catch (error) {
            console.error('Failed to create tier list', error);
        }
    }, [navigate, createTierList]);

    const handleDeleteList = useCallback(
        async (id: string, e: React.MouseEvent) => {
            e.stopPropagation();

            if (!confirm('Are you sure you want to delete this tier list?')) {
                return;
            }

            try {
                await deleteTierList(id);
            } catch (error) {
                console.error('Failed to delete tier list', error);
            }
        },
        [deleteTierList],
    );

    if (isLoading) {
        return <p className="tier-list-loading">Loading tier lists...</p>;
    }

    if (error) {
        return <p className="tier-list-loading">{error}</p>;
    }

    return (
        <main className="tier-list-container">
            <h1 className="tier-list-title">Tier Lists</h1>

            <div className="new-list-section">
                <button className="new-list-button" onClick={() => {
                    setCreateDialogVersion((currentVersion) => currentVersion + 1);
                    setIsCreateDialogOpen(true);
                }} type="button">
                    Create New Tier List
                </button>
            </div>

            <div className="tier-lists-grid">
                {tierLists.length === 0 ? (
                    <p>No tier lists yet. Create one to get started!</p>
                ) : (
                    tierLists.map((tierList) => (
                        <div
                            key={tierList.id}
                            className="tier-list-card"
                            onClick={() => navigate(`/edit/${tierList.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/edit/${tierList.id}`);
                                }
                            }}
                        >
                            <div className="card-content">
                                <h2 className="card-title">{tierList.name}</h2>
                                <p className="card-meta">
                                    {tierList.description?.trim() || 'Open to edit this tier list'}
                                </p>
                            </div>
                            <button
                                className="delete-button"
                                onClick={(e) => handleDeleteList(tierList.id, e)}
                                type="button"
                                aria-label={`Delete ${tierList.name}`}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            <CreateTierListDialog
                key={createDialogVersion}
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateNewList}
                onUploadImage={uploadImage}
            />
        </main>
    );
}

export default HomePage;