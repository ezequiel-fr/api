import { Client } from "@notionhq/client";
import { config } from "dotenv";
config();

const notion = new Client({
    auth: process.env.NOTION_TOKEN_KEY
})
export const createNewDB = async (req, res) => {
    const { name, creator, minrole, description, status } = {
        name: "Test BDD",
        creator: "Le criquet #Owner",
        minrole: "Owner",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sagittis ullamcorper tellus, id euismod nisi finibus a. Nam malesuada semper libero, vel gravida enim facilisis sit amet. Donec interdum augue eget est bibendum, vitae aliquet elit consequat. Mauris consectetur orci non tincidunt ultrices. Aliquam vitae nisl ipsum. Sed consectetur fringilla aliquam. Vestibulum aliquam tellus eu odio imperdiet rhoncus. Nulla cursus tincidunt elit id pellentesque. Sed non imperdiet metus, vel efficitur arcu. Duis at tortor id neque viverra placerat id eget libero. Cras pretium luctus nibh nec facilisis. Nulla facilisi. Nam maximus est ac nunc convallis, vitae cursus erat posuere.",
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