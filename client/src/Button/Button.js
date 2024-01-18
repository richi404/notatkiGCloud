import "./Button.css"

const Button = ({text,onClick, className}) => {
    return (
        <div className={"button "+className} onClick={onClick}>
            {text}
        </div>
    );
}

export default Button;