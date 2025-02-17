from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DeckSerializer, FlashcardUpateSerializer
from rest_framework.decorators import api_view
from firebase_admin import auth, initialize_app, credentials, firestore
from .FSRS import *

# Create your views here.
cred = credentials.Certificate("credentials.json")
initialize_app(cred)
db = firestore.client()

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
        if serializer.is_valid():
            validData = serializer.validated_data
            print(validData)

            doc_ref = db.collection('users').document(uid).collection('decks').document()
            validData['numberOfCards'] = len(validData['flashcards'])
            print(validData)
            doc_ref.set(validData)
            return Response({'message': 'Data received successfully', 'data': {'deckId': doc_ref.id}}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

        doc_ref = db.collection('users').document(uid).collection('decks').document(id)
        if(not doc_ref.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'PATCH':
            serializer = DeckSerializer(data=request.data)
            if serializer.is_valid():
                validData = serializer.validated_data
                validData['numberOfCards'] = len(validData['flashcards'])
                doc_ref.update(validData)
                return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == 'DELETE':
            doc_ref.delete()
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

        doc_ref = db.collection('users').document(uid).collection('decks').stream()
        decks = []
        for doc in doc_ref:
            deckDict = doc.to_dict()
            decks.append({'id': doc.id, 'title': deckDict['title'], 'numberOfCards': deckDict['numberOfCards']})

        return Response(decks, status=status.HTTP_200_OK)
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

        doc_ref = db.collection('users').document(uid).collection('decks').document(id)

        return Response(doc_ref.get().to_dict(), status=status.HTTP_200_OK)
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
        doc_ref = db.collection('users').document(uid).collection('decks').document(id)
        if(not doc_ref.get().exists):
            return Response({'message': 'Deck could not be found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlashcardUpateSerializer(data=request.data)
        flashcards = doc_ref.get().to_dict()['flashcards']
        print(flashcards)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validData = serializer.validated_data
        for i in range(len(flashcards)):
            if flashcards[i]['id'] == validData['id']:
                flashcards[i] = FSRS(flashcards[i], validData['grade'])
        
        doc_ref.update({'flashcards': flashcards})

        return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)
        # doc_ref.update(request.data)
    except auth.InvalidIdTokenError:
        return Response({'message': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)