import os
from dotenv import load_dotenv
import openai
import re
import tiktoken


class GPT:
    def __init__(self):
        self.setting()
        
    def setting(self):
        load_dotenv()
        key = os.getenv("openai")
        openai.api_key = key
    
    def process(self):
        data_dict = {"name_1":["text_1",['col_11','col_12']],
                "name_2":["text_2",['col_21','col_22']],
                "name_3":["text_3",['col_41','col_42']]}
        field = 'ss'
        purpose = 'hi'
        num_topics = 5
        
        prompt = self.prompt_text(data_dict, field, purpose, num_topics)
        
        
        num_tokens = self.num_tokens_from_string(prompt, 'p50k_base')
        
        if num_tokens > 500:
            return 'token이 너무 길다'
        
        topicsList = self.generate_topics(prompt)
        return topicsList
        
    
    def prompt_text(self, data_dict:dict, field:str, purpose:str, num_topics:int) -> str:
        prompt = f"Generate {num_topics} topics in the {field} field for the following purpose: {purpose}\n\nData:\n"
        for key, value in data_dict.items():
            prompt += f"- {key} ({len(value[1])} columns): {value[0]}\n\tColumns: {', '.join(value[1])}\n"
        prompt += f"\n1. \n2. \n3. \n4. \n5. \n"
        return prompt
    
    
    def num_tokens_from_string(self, string: str, encoding_name: str='p50k_base') -> int:
        """Returns the number of tokens in a text string.

        Args:
            string (str): _description_
            encoding_name (str, optional): _description_. Defaults to 'p50k_base'.

        Returns:
            int: _description_
        """
        encoding = tiktoken.get_encoding(encoding_name)
        num_tokens = len(encoding.encode(string))
        return num_tokens
        # num_tokens_from_string(res, 'p50k_base')
    
    def generate_topics(self, prompt:str, temperature:float=0.5, max_tokens:int=500,
                        top_p:float=1, frequency_penalty:float=1,
                        presence_penalty:float=1, timeout:int=10, n:int=1) -> list:
        """_summary_

        Args:
            prompt (str): _description_
            temperature (float, optional): _description_. Defaults to 0.5.
            max_tokens (int, optional): _description_. Defaults to 500.
            top_p (float, optional): _description_. Defaults to 1.
            frequency_penalty (float, optional): _description_. Defaults to 1.
            presence_penalty (float, optional): _description_. Defaults to 1.
            timeout (int, optional): _description_. Defaults to 10.
            n (int, optional): _description_. Defaults to 1.

        Returns:
            list: _description_
        """
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            timeout=timeout,
            n=n,
            stop=None
            )
        topics = re.findall(r"\d+\.\s(.+)", response.choices[0].text)
        return topics

