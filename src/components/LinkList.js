import React, { Component } from "react";
import Link from "./Link";
import { Query } from "react-apollo";
import { LINKS_PER_PAGE } from "../constants";
import { NEW_VOTE_SUBSCRIPTION, NEW_LINK_SUBSCRIPTION } from "../operations/Subscription";
import { FEED_QUERY } from "../operations/Query";

class LinkList extends Component {
  updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE: 0;
    const first = isNewPage ? LINKS_PER_PAGE: 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });
    
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes;
    store.writeQuery({ query: FEED_QUERY, data })
  }

  subscribeToNewLinks = async (subscribeToMore) => {
    subscribeToMore({
      document: NEW_LINK_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink
        const exists = prev.feed.links.find(({ id }) => id === newLink.id)
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTE_SUBSCRIPTION
    })
  }

  getQueryVariables = (props) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { first, skip, orderBy };
  }

  getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new');
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  }

  renderNextPage = data => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  }

  renderPreviousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  }

  render() {
    return (
      <Query query={FEED_QUERY} variables={this.getQueryVariables()}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching...</div>;
          if (error) return <div>Error</div>;
          this.subscribeToNewLinks(subscribeToMore);
          this.subscribeToNewVotes(subscribeToMore);
          const linksToRender = this._getLinksToRender(data);
          const isNewPage = this.props.location.pathname.includes('new');
          const pageIndex = this.props.match.params.page
            ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
            : 0;

          return (
            <>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index}
                  updateStoreAfterVote={this.updateCacheAfterVote} />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div className="pointer mr2" onClick={this.renderPreviousPage}>
                    Previous
                </div>
                  <div className="pointer" onClick={() => this.renderNextPage(data)}>
                    Next
                </div>
                </div>
              )}
            </>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
