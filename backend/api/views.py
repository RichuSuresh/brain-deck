from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DeckSerializer, FlashcardUpateSerializer, DeckUpdateSerializer, FileSerializer
from rest_framework.decorators import api_view
from firebase_admin import auth, initialize_app, credentials, firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter, Or
from .FSRS import *
from .OllamaGenerate import generateFlashcardDeck

# Create your views here.
cred = credentials.Certificate("credentials.json")
initialize_app(cred)
db = firestore.client()

@api_view(['DELETE'])
def deleteUser(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        try:
            auth.delete_user(uid)
            
            user_ref = db.collection('users').document(uid)
            if(user_ref.get().exists):
                user_ref.delete()

            return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)
        except:
            return Response({'message': 'User could not be deleted, please login again.'}, status=status.HTTP_400_BAD_REQUEST)

    except auth.InvalidIdTokenError:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def createDeck(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        serializer = DeckSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validData = serializer.validated_data
        deck = db.collection('users').document(uid).collection('decks').document()
        batch = db.batch()

        if "parameters" not in validData:
            validData['parameters'] = getDefaultParameters()
        
        if "retentionRate" not in validData:
            validData['retentionRate'] = getDefaultRetentionRate()

        batch.set(deck, {'title': validData['title'], 'numberOfCards': len(validData['flashcards']), 'parameters': validData['parameters'], 'retentionRate': validData['retentionRate']})

        flashcards_ref = deck.collection('flashcards')
        for flashcard in validData['flashcards']:
            batch.set(flashcards_ref.document(), {'term': flashcard['term'], 'definition': flashcard['definition'], 'nextInterval': None})

        batch.commit()
        return Response({'message': 'Data received successfully', 'data': {'deckId': deck.id}}, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token. please try logging in again.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PATCH', 'DELETE'])
def editDeck(request, id):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        deck = db.collection('users').document(uid).collection('decks').document(id)
        if(not deck.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'PATCH':
            serializer = DeckUpdateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            batch = db.batch()
            editDetails = serializer.validated_data
            originalFlashcards = deck.collection('flashcards')
            newCards = editDetails['newFlashcards']
            updatedCards = editDetails['updatedFlashcards']
            deletedCards = editDetails['deletedFlashcards']

            numberOfCards = deck.get().to_dict()['numberOfCards']
            batch.update(deck, {'numberOfCards': numberOfCards + len(newCards) - len(deletedCards)})
            for card in newCards:
                batch.set(originalFlashcards.document(), {'term': card['term'], 'definition': card['definition'], 'nextInterval': None})
            
            for id, card in updatedCards.items():
                batch.update(originalFlashcards.document(id), card)
            
            for id in deletedCards:
                batch.delete(originalFlashcards.document(id))
            
            if "title" in editDetails:
                batch.update(deck, {'title': editDetails['title']})
            
            if "parameters" in editDetails:
                batch.update(deck, {'parameters': editDetails['parameters']})
            
            if "retentionRate" in editDetails:
                batch.update(deck, {'retentionRate': editDetails['retentionRate']})

            batch.commit()

            return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
            deck.delete()
            return Response({'message': 'Data deleted successfully'}, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def getAllDecks(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        today = datetime.now(timezone.utc)

        decks_ref =  db.collection('users').document(uid).collection('decks')
        decks = decks_ref.stream()
        response = []
        for deck in decks:
            query = decks_ref.document(deck.id).collection('flashcards').where(filter=Or(
                [
                    FieldFilter("nextInterval", "<=", today),
                    FieldFilter("nextInterval", "==", None)
                ]
            ))
            aggregate_query = aggregation.AggregationQuery(query)
            aggregate_query.count(alias="all")
            results = aggregate_query.get()
            numOfCardsToReview = results[0][0].value

            deckDict = deck.to_dict()
            response.append({'id': deck.id, 'title': deckDict['title'], 'numberOfCards': deckDict['numberOfCards'], 'numberOfCardsToReview': numOfCardsToReview})

        return Response(response, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def getAllDecksToReview(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        today = datetime.now(timezone.utc)

        decks_ref =  db.collection('users').document(uid).collection('decks')
        decks = decks_ref.stream()
        response = []
        for deck in decks:
            query = decks_ref.document(deck.id).collection('flashcards').where(filter=Or(
                [
                    FieldFilter("nextInterval", "<=", today),
                    FieldFilter("nextInterval", "==", None)
                ]
            ))
            aggregate_query = aggregation.AggregationQuery(query)
            aggregate_query.count(alias="all")
            results = aggregate_query.get()
            numOfCardsToReview = results[0][0].value

            deckDict = deck.to_dict()
            if(numOfCardsToReview > 0):
                response.append({'id': deck.id, 'title': deckDict['title'], 'numberOfCardsToReview': numOfCardsToReview})

        return Response(response, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def getDeckToReview(request, id):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        deck = db.collection('users').document(uid).collection('decks').document(id)
        if(not deck.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)
        
        today = datetime.now(timezone.utc)
        flashcards =  deck.collection('flashcards').where(filter=Or(
            [
                FieldFilter("nextInterval", "<=", today),
                FieldFilter("nextInterval", "==", None)
            ]
        ))
        deck = deck.get().to_dict()
        deck = {'title': deck['title'], 'flashcards': []}

        flashcards = flashcards.stream()
        for flashcard in flashcards:
            id = flashcard.id
            flashcard = flashcard.to_dict()
            deck['flashcards'].append({'id': id, 'term': flashcard['term'], 'definition': flashcard['definition']})

        return Response(deck, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def getDeck(request, id):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        deck_ref = db.collection('users').document(uid).collection('decks').document(id)
        if(not deck_ref.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)
        
        deck = deck_ref.get().to_dict()
        deck = {'title': deck['title'], 'flashcards': [], 'parameters': deck['parameters'], 'retentionRate': deck['retentionRate']}

        flashcards = deck_ref.collection('flashcards').stream()
        for flashcard in flashcards:
            id = flashcard.id
            flashcard = flashcard.to_dict()
            deck['flashcards'].append({'id': id, 'term': flashcard['term'], 'definition': flashcard['definition']})

        return Response(deck, status=status.HTTP_200_OK)

    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['PATCH'])
def updateFlashcard(request, id):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        deck = db.collection('users').document(uid).collection('decks').document(id)
        if(not deck.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlashcardUpateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validData = serializer.validated_data
        flashcard = deck.collection('flashcards').document(validData['id'])
        if not flashcard.get().exists:
            return Response({'message': 'Flashcard could not be found.'}, status=status.HTTP_404_NOT_FOUND)
        
        flashcardDict = flashcard.get().to_dict()
        today = datetime.now(timezone.utc)
        if("nextInterval" in flashcardDict and flashcardDict["nextInterval"] != None):
            if(today < flashcardDict["nextInterval"]):
                return Response({'message': 'Cannot review flashcard before next review date'}, status=status.HTTP_400_BAD_REQUEST)
        
        deck = deck.get().to_dict()
        fsrsData = FSRS(flashcard.get().to_dict(), validData['grade'], deck['parameters'], deck['retentionRate'])
        flashcard.update(fsrsData)

        return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)
        # doc_ref.update(request.data)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def generateDeck(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'message': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        auth.verify_id_token(token)
        serializer = FileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validData = serializer.validated_data
        deck = generateFlashcardDeck(validData['files'])
        if('title' not in deck or 'flashcards' not in deck):
            return Response({'message': 'Deck could not be generated.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(deck, status=status.HTTP_201_CREATED)
        
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)
    except ConnectionError:
        return Response({'message': 'Could not connect to Ollama API'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)