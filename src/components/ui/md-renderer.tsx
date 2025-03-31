import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MdRendererProps {
    content: string;
}



const MdRenderer: React.FC<MdRendererProps> = ({ content }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
};



export default MdRenderer;
