import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
const BackButton = ({ to, className = '', variant = 'ghost', size = 'md', }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        if (to) {
            navigate(to);
        }
        else {
            navigate(-1);
        }
    };
    return (_jsxs(Button, { onClick: handleClick, variant: variant, size: size, className: `inline-flex items-center gap-2 ${className}`, children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), _jsx("span", { children: "Back" })] }));
};
BackButton.displayName = 'BackButton';
export default BackButton;
//# sourceMappingURL=BackButton.js.map