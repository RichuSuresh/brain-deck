# Brain Deck
A web app for creating flashcards or generating them using AI. Made using React and Django, with firebase as the datastore

# Installation
For development and testing, use the development branch: ```git clone git@github.com:RichuSuresh/brain-deck.git``` and then ```git checkout development```
## Backend
1. ```cd /backend```
2. (optional) install a python virtual environment: ```python -m venv env``` and activate it by doing ```cd env```, then ```cd Scripts``` then ```activate```
3. Install dependencies ```pip install -r requirements.txt```

## frontend
1. ```cd frontend```
2. ```npm install```

## Ollama docker container
1. Download docker desktop https://www.docker.com/products/docker-desktop/
   
3. On docker desktop, go to Docker Hub and search for "ollama"
![image](https://github.com/user-attachments/assets/63957d48-4803-441f-b5f1-c05062f73114)

4. Click on "ollama/ollama"
   
6. Click "pull"
![image](https://github.com/user-attachments/assets/42218a00-cba2-4732-907f-4579f35d68a0)

8. Once the image has been pulled, click on the "images" tab on the left
   
10. Click the play button
![image](https://github.com/user-attachments/assets/b2c743c6-30a7-468d-b2da-dda474cf90c2)

12. On the popup, click optional settings
    
14. Set the container name to ollama and the Host port to 11434
![image](https://github.com/user-attachments/assets/74fc4ab3-cf16-4a58-ab80-19249fa62124)

15. On the container menu, click the exec tab
![image](https://github.com/user-attachments/assets/9d755b59-1421-4d20-b34c-b861460f12ee)

16. In the console type ```ollama pull gemma3:4b``` to install the 4 billion parameter Gemma model

# Starting development mode
## Backend
1. ```cd backend```
   
3. ```python manage.py runserver```. This should start the backend

## Frontend
1. ```cd frontend```
   
3. ```npm run dev```
   
5. Once the app is running, vite should present you with a link to the app in the terminal

## ollama docker container
1. On docker desktop, click on the Containers tab

3. Click Start

![image](https://github.com/user-attachments/assets/6b9e7818-7ba4-4549-a246-23a5fdee69ec)




