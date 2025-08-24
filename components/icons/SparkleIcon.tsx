
import React from 'react';

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M12.0001 22.0001L10.2431 13.7571L2.00006 12.0001L10.2431 10.2431L12.0001 2.00006L13.7571 10.2431L22.0001 12.0001L13.7571 13.7571L12.0001 22.0001Z" />
    </svg>
);

export default SparkleIcon;
