import { Client } from "@notionhq/client";
import { config } from "dotenv";
config();

// Connection to Notion with token in .env
const notion = new Client({
    auth: process.env.NOTION_TOKEN_KEY
})

export const createNewDB = async (req, res) => {
    // Soon the value will be req.body don't worry
    const { name, creator, minrole, description, status } = {
        name: "First test",
        creator: "Le criquet #Owner",
        minrole: "Owner",
        description: "Une base de données pour les test de developpement et uniquement pour ca (serat supprimer quand la fonction supprimer serat disponible)",
        status: "on"
    };

    // it's to generate Token with a length of 64
    function generateToken() {
        const possibilities = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789123456789";
        var result = "secret_";
        for (var i = 0; i < 64; i++) {
          result += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
        }
      
        return result;
      }

    try{
        // Create a new data base for the user with original row like Name Numero and Other properties
        const newTable = await notion.databases.create({
            parent: { page_id: '99d82f06f95749a685ad597016e085cb' },
            title: [ { type: 'text', text: { content: name } } ],
            properties: {
                Name: { title: {} },
                Numero: { number: {} },
                "Other properties": { rich_text: {} }
            }
        })

        // And we add it in "Tokens bdd" on notion with token and id retrieve on const newTable
        const response = await notion.pages.create({
            parent: {  database_id: process.env.TOKENS_TABLE_ID },
            properties: {
                Token: { title: [{ text: {content: generateToken()} }] },
                Id: { rich_text: [{ text: { content: newTable.id} }] },
                Creator: { rich_text: [{ text: { content: creator } }] },
                Name: { rich_text: [{ text: { content: name } }] },
                MinRole: { rich_text: [{ text: { content: minrole } }] },
                Description: { rich_text: [{ text: { content: description } }] },
                Status: { rich_text: [{ text: { content: status } }] }
            }
        })

        res.status(201).json({ results: response })
    }catch(err){
        console.error(err)
    }
}

export const addRow = async (req, res) => {
    // Same here, soon it will be req.body for token and name
    const token = "secret_vFiZT3C44POr4yZk9A42dE56t5RjTJ3W3OgeowqmyuqYz44O5NRaG5RmGHmEpoE4";
    const name = "New row"

    try{
        // Search the token on the db and if it match we take the id
        const searchResponse = await notion.databases.query({
            database_id: process.env.TOKENS_TABLE_ID,
            filter: {
                or: [
                    {
                        property: "Token",
                        title: { equals: token }
                    }
                ]
            }
        })
        
        // If no token are find
        if (searchResponse.results.length === 0) {
            console.error("Le token n'a pas été trouvé.");
        }
        // take the id of the user db
        var pageId = searchResponse.results[0].properties.Id.rich_text[0].text.content

        // retrieve properties of the db
        const database = await notion.databases.retrieve({
            database_id: pageId
        })
        // add a properties soon replace rich_text by an option like title number date etc
        database.properties[name] = { rich_text: {} }

        // And we update the db
        await notion.databases.update({
            database_id: pageId,
            properties: database.properties
        })
    }
    catch(err){
        console.error(err)
    }
}

export const editRowName = async () => {
    const { token, currentColumnName, newColumnName } = {
        token: "secret_vFiZT3C44POr4yZk9A42dE56t5RjTJ3W3OgeowqmyuqYz44O5NRaG5RmGHmEpoE4",
        currentColumnName: "New row",
        newColumnName: "New name of column"
    }

    try {
        const searchResponse = await notion.databases.query({
            database_id: process.env.TOKENS_TABLE_ID,
            filter: { or: [{ property: "Token", title: { equals: token } }] }
        })

        if(searchResponse.results.length === 0){
            console.error("Le token n'a pas été trouvé.")
            return;
        }

        const pageId = searchResponse.results[0].properties.Id.rich_text[0].text.content;
    
        const database = await notion.databases.retrieve({
            database_id: pageId
        })

        const propertyToUpdate = Object.entries(database.properties).find(([ key, value ]) => {
            if (value.name == "New row"){
                return true;
            }
            return false
        })

        if(!propertyToUpdate){
            console.error("La colonne n'a pas été trouvée.")
        }

        const [, propertyvalue ] = propertyToUpdate
        propertyvalue.name = newColumnName

        await notion.databases.update({
            database_id: pageId,
            properties: database.properties
        })
    }
    catch(err){
        console.error(err)
    }
}

export const editRowProperty = async () => {
    const { token, columnName, newProperty } = {
        token: "secret_vFiZT3C44POr4yZk9A42dE56t5RjTJ3W3OgeowqmyuqYz44O5NRaG5RmGHmEpoE4",
        columnName: "New name of column",
        newProperty: "number"
    };

    const propertyPossibilities = {
        text: {
            name: columnName,
            type: 'rich_text',
            rich_text: {}
        },
        number: {
            name: columnName,
            type: 'number',
            number: { format: 'number' }
        }
    }

    try {
        const searchResponse = await notion.databases.query({
            database_id: process.env.TOKENS_TABLE_ID,
            filter: { or: [{ property: "Token", title: { equals: token } }] }
        });

        if (searchResponse.results.length === 0) {
            console.error("Le token n'a pas été trouvé.");
            return;
        }

        const databaseId = searchResponse.results[0].properties.Id.rich_text[0].text.content;
        const database = await notion.databases.retrieve({ database_id: databaseId });

        const newProperties = Object.fromEntries(
            Object.entries(database.properties).filter(([key, value]) => value.name !== columnName)
        );
        newProperties[columnName] = propertyPossibilities[newProperty]

        await notion.databases.update({
            database_id: databaseId,
            properties: newProperties
        });
    } catch (err) {
        console.error(err);
    }
};