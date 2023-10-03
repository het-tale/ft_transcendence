import React from 'react';
import Search from './Search';

const NavbarSearch = function (props: any) {
    return (
        <div className="navbar">
            <div className="logo">
                <span className="TwinP">
                    <span className="text-style-1">T</span>winP
                </span>
                <svg
                    className="racquet"
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="55.000000pt"
                    height="57.000000pt"
                    viewBox="0 0 1095.000000 616.000000"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <g
                        transform="translate(0.000000,616.000000) scale(0.100000,-0.100000)"
                        fill="#a435f0"
                        stroke="none"
                    >
                        <path
                            d="M4908 4613 l-48 -48 283 -266 c155 -146 299 -280 320 -299 92 -80
                116 -199 61 -298 -65 -119 -66 -121 -65 -185 1 -109 61 -243 170 -379 71 -89
                298 -312 402 -396 242 -194 494 -326 748 -390 95 -24 125 -27 281 -27 152 0
                185 3 255 23 150 43 281 120 354 209 100 122 39 325 -166 552 l-49 54 -49 -19
                c-34 -13 -75 -19 -130 -19 -68 0 -89 5 -145 31 -79 38 -140 97 -177 172 -23
                47 -29 73 -31 148 l-4 92 -106 50 c-114 53 -200 85 -407 151 -72 23 -174 61
                -228 85 -193 87 -219 109 -541 445 -224 234 -307 314 -343 332 -42 21 -66 24
                -193 27 l-145 3 -47 -48z"
                        />
                        <path
                            d="M4405 2835 c-253 -26 -545 -92 -750 -169 -208 -79 -289 -179 -256
                -318 18 -82 51 -135 118 -199 132 -122 334 -187 773 -245 166 -23 652 -26 890
                -6 85 7 250 15 365 18 l210 6 440 -137 c521 -162 488 -159 680 -71 106 48 121
                58 133 88 15 36 12 122 -6 140 -9 9 -326 95 -697 188 -178 45 -250 78 -272
                125 -17 35 -16 39 1 83 10 26 24 64 32 84 19 51 9 90 -38 143 -92 104 -395
                201 -813 261 -153 22 -637 27 -810 9z"
                        />
                    </g>
                </svg>
                <span className="ng">ng</span>
            </div>
            <Search />
        </div>
    );
};

export default NavbarSearch;
