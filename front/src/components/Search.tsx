import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import client from './Client';
import { UserType } from '../Types/User';
import GetDms from '../pages/Chat/GetDms';
import { set } from 'react-hook-form';

const Search = (props: any) => {
    const [opa, setOpa] = useState(0);
    console.log('THIS IS the name u wrote', props.filter);
    const HandleSearch = async () => {
        try {
            setOpa(1);
            const res = await client.get(
                `chat/search-conversations/${props.filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('THIS IS THE RESULTTTT', res);
            if (res.data.length > 0) {
                props.setDms(res.data);
            } else {
                props.setDms([]);
            }
        } catch (error: any) {
            GetDms().then((data) => {
                props.setDms(data);
            });
            console.log('THIS IS THE ERROR', error);
        }
    };
    const reset = () => {
        props.setName('');
        GetDms().then((data) => {
            props.setDms(data);
        });
        setOpa(0);
    };
    return (
        <form className={`form ${props.name}`} onKeyUp={HandleSearch}>
            <input
                className="input"
                placeholder="Search..."
                required={true}
                type="text"
                value={props.filter}
                onChange={(e) => props.setName(e.target.value)}
            />
            <button
                className="reset"
                type="reset"
                onClick={reset}
                style={{ opacity: `${opa}` }}
            >
                <i className="fas fa-times"></i>
            </button>
        </form>
    );
};

export default Search;
