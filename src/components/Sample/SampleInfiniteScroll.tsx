import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface SampleInfiniteScrollProps {}
const SampleInfiniteScroll: React.FC<SampleInfiniteScrollProps> = ({}) => {
  const [items, setItems] = useState(Array.from({ length: 20 }));
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreData = () => {
    // Simulate an API call.
    setTimeout(() => {
      const newItems = Array.from({ length: 20 });
      setItems((prevItems) => [...prevItems, ...newItems]);

      // Set hasMore to false when there's no more data to load.
      if (items.length > 100) {
        setHasMore(false);
      }
    }, 1500);
  };

  return (
    <div id="scrollableDiv" className="h-[300px] overflow-auto">
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all!</b>
          </p>
        }
        scrollableTarget="scrollableDiv"
      >
        {items.map((_, index) => (
          <div
            key={index}
            style={{ margin: 20, padding: 20, border: "1px solid #ccc" }}
          >
            Item #{index}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};
export default SampleInfiniteScroll;
