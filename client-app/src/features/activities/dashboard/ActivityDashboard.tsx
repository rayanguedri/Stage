import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid, Loader, Input } from 'semantic-ui-react';
import { PagingParams } from '../../../app/models/pagination';
import { useStore } from '../../../app/stores/store';
import ActivityFilters from './ActivityFilters';
import ActivityList from './ActivityList';
import ActivityListItemPlaceholder from './ActivityListItemPlaceHolder';

export default observer(function ActivityDashboard() {
    const { activityStore } = useStore();
    const { loadActivities, setPagingParams, pagination, searchQuery, setSearchQuery } = activityStore;
    const [loadingNext, setLoadingNext] = useState(false);

    function handleGetNext() {
        setLoadingNext(true);
        setPagingParams(new PagingParams(pagination!.currentPage + 1));
        loadActivities().then(() => setLoadingNext(false));
    }

    useEffect(() => {
        loadActivities();
    }, [loadActivities, searchQuery]);

    function handleSearchInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }

    function handleClearSearch() {
        setSearchQuery('');
    }

    return (
        
        <Grid>
            
            <Grid.Column width='10'>
                <Input
                    fluid
                    icon='search'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    action={{
                        icon: 'close',
                        onClick: handleClearSearch,
                        disabled: !searchQuery,
                        circular: true,
                    }}
                    onKeyDown={(e: { key: string; stopPropagation: () => void; }) => {
                        if (e.key === ' ') e.stopPropagation();
                    }}
                />
                {activityStore.loadingInitial && !loadingNext ? (
                    <>
                        <ActivityListItemPlaceholder />
                        <ActivityListItemPlaceholder />
                    </>
                ) : (
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={handleGetNext}
                        hasMore={!loadingNext && !!pagination && pagination.currentPage < pagination.totalPages}
                        initialLoad={false}
                    >
                        <ActivityList />
                    </InfiniteScroll>
                )}
            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilters />
            </Grid.Column>
            <Grid.Column width='10'>
                <Loader active={loadingNext} />
            </Grid.Column>
        </Grid>
    );
});
