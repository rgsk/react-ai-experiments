import { DependencyList, useCallback, useEffect } from "react";

const useEnsureScrolledToBottom = ({
  scrollContainerRef,
  observedImagesClassname,
  observerDeps,
  scrollBottomDeps,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  observedImagesClassname: string;
  observerDeps?: DependencyList;
  scrollBottomDeps?: DependencyList;
}) => {
  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight - scrollContainer.clientHeight,
      });
    }
  }, [scrollContainerRef]);
  useEffect(() => {
    scrollToBottom();
  }, [
    scrollToBottom,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(scrollBottomDeps ?? []),
  ]);
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Create a ResizeObserver to observe changes in the dimensions of the images
      const resizeObserver = new ResizeObserver(() => {
        scrollToBottom();
      });
      // Function to observe new images
      const observeImages = () => {
        const images = scrollContainer.querySelectorAll(
          `img.${observedImagesClassname}`
        );
        images.forEach((image) => resizeObserver.observe(image));
      };

      // Create a MutationObserver to observe changes in the child elements
      const observer = new MutationObserver(() => {
        // if images are added to the DOM we attach resize observer to those images
        observeImages();
      });

      // Configure the observer to watch for changes in child nodes or subtree
      observer.observe(scrollContainer, {
        childList: true,
        subtree: true,
      });

      // Cleanup observer on component unmount
      return () => {
        observer.disconnect();
        resizeObserver.disconnect();
      };
    }
  }, [
    scrollContainerRef,
    scrollToBottom,
    observedImagesClassname,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(observerDeps ?? []),
  ]);
  return { scrollToBottom };
};
export default useEnsureScrolledToBottom;
