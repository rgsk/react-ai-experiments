interface OpenInNewTabIconProps {
  size?: number;
}
const OpenInNewTabIcon: React.FC<OpenInNewTabIconProps> = ({ size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Icon">
        <path
          fill="currentcolor"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.7497 10.75L13.7497 11.5L13.7497 13.2494C13.7497 14.2159 12.9662 14.9994 11.9997 14.9994L2.75 14.9994C1.7835 14.9994 1 14.2159 1 13.2494L1 4C1 3.0335 1.7835 2.25 2.75 2.25L4.49966 2.25L5.24966 2.25L5.24966 3.75L4.49966 3.75L2.75 3.75C2.61193 3.75 2.5 3.86193 2.5 4L2.5 13.2494C2.5 13.3875 2.61193 13.4994 2.75 13.4994L11.9997 13.4994C12.1377 13.4994 12.2497 13.3875 12.2497 13.2494L12.2497 11.5L12.2497 10.75L13.7497 10.75Z"
        ></path>
        <path
          fill="none"
          stroke="currentcolor"
          d="M7 8V3C7 2.44772 7.44772 2 8 2H13C13.5523 2 14 2.44772 14 3V8C14 8.55228 13.5523 9 13 9H8C7.44772 9 7 8.55228 7 8Z"
          stroke-width="1.5"
        ></path>
      </g>
    </svg>
  );
};
export default OpenInNewTabIcon;
