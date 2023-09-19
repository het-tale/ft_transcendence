import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

const Search = (props: any) => {
    const [name, setName] = useState("");
    return (
        <form className={`form ${props.name}`}>
            <input className="input" placeholder="Search..." required={true} type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="reset" type="reset"></button>
        </form>
    );
}

export default Search;