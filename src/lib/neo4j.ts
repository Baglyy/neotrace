import neo4j from 'neo4j-driver';

const NEO4J_URI = import.meta.env.VITE_NEO4J_URI;
const NEO4J_USER = import.meta.env.VITE_NEO4J_USER;
const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD;

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);