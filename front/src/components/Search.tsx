import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import client from './Client';
import { UserType } from '../Types/User';
import GetDms from '../pages/Chat/GetDms';

interface SearchProps {
    isSearchGlobal?: boolean;
    setDms?: React.Dispatch<React.SetStateAction<UserType[]>>;
    dms?: UserType[];
    setName?: React.Dispatch<React.SetStateAction<string>>;
    filter?: string;
    setFirstLoad?: React.Dispatch<React.SetStateAction<string>>;
    name?: string;
    users?: UserType[];
    setUsers?: React.Dispatch<React.SetStateAction<UserType[]>>;
}

const Search = (props: SearchProps) => {
    const [opa, setOpa] = useState(0);
    // console.log('THIS IS the name u wrote', props.filter);
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
            // console.log('THIS IS THE RESULTTTT', res);
            if (res.data.length > 0) {
                props.setDms && props.setDms(res.data);
            } else {
                props.setDms && props.setDms([]);
            }
        } catch (error: any) {
            GetDms().then((data) => {
                props.setDms && props.setDms(data);
            });
            // console.log('THIS IS THE ERROR', error);
        }
    };
    const reset = () => {
        props.setName && props.setName('');
        GetDms().then((data) => {
            props.setDms && props.setDms(data);
        });
        setOpa(0);
    };
    const HandleGlobalSearch = async () => {
        // console.log('THIS IS THE GLOBAL SEARCH');
        try {
            setOpa(1);
            const res = await client.get(`user/search-users/${props.filter}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // console.log('THIS IS THE RESULTTTT', res);
            if (res.data.length > 0) {
                props.setUsers && props.setUsers(res.data);
            } else {
                props.setUsers && props.setUsers([]);
            }
        } catch (error: any) {
            // console.log('THIS IS THE ERROR', error);
        }
    };
    return (
        <form
            className={`form ${props.name}`}
            onKeyUp={props.isSearchGlobal ? HandleGlobalSearch : HandleSearch}
        >
            <input
                className="input"
                placeholder="Search..."
                required={true}
                type="text"
                value={props.filter}
                onChange={(e) => props.setName!(e.target.value)}
            />
            <button
                className="reset"
                type="reset"
                onClick={!props.isSearchGlobal ? reset : () => {}}
                style={{ opacity: `${opa}` }}
            >
                <i className="fas fa-times"></i>
            </button>
        </form>
    );
};

export default Search;
