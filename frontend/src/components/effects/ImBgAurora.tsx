"use client";

import './ImBgAurora.css';

export function ImBgAurora() {
    return (
        <div className="im-bg" aria-hidden="true">
            <div className="im-bghaze" />
            <div className="im-bgblob im-bgblob--a" />
            <div className="im-bgblob im-bgblob--b" />
            <div className="im-bgblob im-bgblob--c" />
            <div className="im-bggraindiv" />
        </div>
    );
}
