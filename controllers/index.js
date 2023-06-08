import { Client } from "@notionhq/client";
import { config } from "dotenv";
config();

const notion = new Client({
    auth: process.env.NOTION_TOKEN_KEY
})

export const createNewDB = async (req, res) => {
    const { name, creator, minrole, description, status } = {
        name: "First test",
        creator: "Le criquet #Owner",
        minrole: "Owner",
        description: "Une base de données pour les test de developpement et uniquement pour ca (serat supprimer quand la fonction supprimer serat disponible)",
        status: "on"
    };

    function generateTI(option) {
        const possibilities = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789123456789";
        var result = option ? "secret_" : "";
        var length = option ? 64 : 20;
      
        for (var i = 0; i < length; i++) {
          result += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
        }
      
        return result;
      }

    try{
        const newTable = await notion.databases.create({
            parent: { page_id: '99d82f06f95749a685ad597016e085cb' },
            title: [ { type: 'text', text: { content: name } } ],
            properties: {
                Name: { title: {} },
                Numero: { number: {} },
                "Other properties": { rich_text: {} }
            }
        })

        const response = await notion.pages.create({
            parent: {  database_id: process.env.TOKENS_TABLE_ID },
            properties: {
                Token: { title: [{ text: {content: generateTI(1)} }] },
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
        console.log(err)
    }
}

export const addRow = async (req, res) => {
    const token = "secret_vFiZT3C44POr4yZk9A42dE56t5RjTJ3W3OgeowqmyuqYz44O5NRaG5RmGHmEpoE4";
    const name = "New row"

    try{
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
        
        if (searchResponse.results.length === 0) {
            return res.status(404).json({ error: "Le token n'a pas été trouvé." });
        }
        var pageId = searchResponse.results[0].properties.Id.rich_text[0].text.content


        const database = await notion.databases.retrieve({
            database_id: pageId
        })
        database.properties[name] = { rich_text: {} }

        await notion.databases.update({
            database_id: pageId,
            properties: database.properties
        })


        console.log(database)
    }
    catch(err){
        console.error(err)
    }
}
