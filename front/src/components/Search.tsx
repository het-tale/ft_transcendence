import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

const Search = () => {
    const [name, setName] = useState("");
    return (
        <form className="form">
            <button>
                <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                    <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </button>
            <input className="input" placeholder="Search..." required={true} type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="reset" type="reset">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M1719 4922 c-307 -123 -565 -290 -803 -522 -473 -460 -728 -1032
-753 -1690 -32 -858 389 -1669 1113 -2146 864 -570 2005 -532 2839 95 114 86
318 280 410 391 164 198 304 436 400 680 51 132 43 194 -36 253 -46 33 -94 32
-219 -6 -226 -68 -417 -97 -652 -97 -471 0 -915 151 -1303 443 -103 78 -314
289 -392 392 -294 391 -443 829 -443 1308 0 231 29 422 97 647 38 125 39 174
6 219 -60 79 -127 88 -264 33z m-125 -479 c-39 -207 -43 -551 -9 -773 115
-748 540 -1384 1179 -1763 501 -296 1104 -409 1674 -313 39 7 72 10 72 6 0
-15 -96 -167 -163 -257 -467 -628 -1256 -953 -2031 -838 -775 115 -1427 643
-1700 1378 -299 803 -86 1714 538 2304 54 51 135 121 181 155 81 60 250 168
265 168 4 0 1 -30 -6 -67z"/>
</g>
</svg>
            </button>
        </form>
    );
}

export default Search;