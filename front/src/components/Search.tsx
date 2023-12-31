import React from 'react';
import { useState } from 'react';
import client from './Client';
import { UserType } from '../Types/User';
import GetDms from '../pages/Chat/GetDms';
import GetRoomDms from '../pages/Chat/GetRoomDms';

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
    showHide?: boolean;
    setShowHide?: React.Dispatch<React.SetStateAction<boolean>>;
    isDm?: boolean;
}

const Search = (props: SearchProps) => {
    const [opa, setOpa] = useState(0);
    const handleDmSearch = async () => {
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
            if (res.data.length > 0) {
                props.setDms && props.setDms(res.data);
            } else {
                props.setDms && props.setDms([]);
            }
        } catch (error: any) {
            GetDms().then((data) => {
                props.setDms && props.setDms(data);
            });
        }
    };
    const reset = () => {
        props.setName && props.setName('');
        props.isDm
            ? GetDms().then((data) => {
                  props.setDms && props.setDms(data);
              })
            : GetRoomDms().then((data) => {
                  props.setDms && props.setDms(data);
              });
        setOpa(0);
    };
    const handleRoomSearch = async () => {
        try {
            setOpa(1);
            const res = await client.get(
                `chat/search-channels/${props.filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.length > 0) {
                props.setDms && props.setDms(res.data);
            } else {
                props.setDms && props.setDms([]);
            }
        } catch (error: any) {
            props.isDm
                ? GetDms().then((data) => {
                      props.setDms && props.setDms(data);
                  })
                : GetRoomDms().then((data) => {
                      props.setDms && props.setDms(data);
                  });
        }
    };
    const HandleGlobalSearch = async () => {
        try {
            props.setShowHide && props.setShowHide(true);
            setOpa(1);
            const res = await client.get(`user/search-users/${props.filter}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.length > 0) {
                props.setUsers && props.setUsers(res.data);
            } else {
                props.setUsers && props.setUsers([]);
            }
        } catch (error: any) {
        }
    };
    return (
        <form
            className={`form ${props.name}`}
            onKeyUp={
                props.isSearchGlobal
                    ? HandleGlobalSearch
                    : props.isDm
                    ? handleDmSearch
                    : handleRoomSearch
            }
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
                onClick={
                    !props.isSearchGlobal
                        ? reset
                        : () => {
                              props.setName && props.setName('');
                              props.setUsers && props.setUsers([]);
                              setOpa(0);
                          }
                }
                style={{ opacity: `${opa}` }}
            >
                <i className="fas fa-times"></i>
            </button>
        </form>
    );
};

export default Search;
