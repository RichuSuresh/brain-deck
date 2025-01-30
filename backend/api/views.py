from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DeckSerializer
from rest_framework.decorators import api_view
from firebase_admin import auth, initialize_app, credentials, firestore

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

            doc_ref = db.collection('users').document(uid).collection('decks').document()
            validData['numberOfCards'] = len(validData['flashcards'])
            doc_ref.set(validData)

            return Response({'message': 'Data received successfully', 'data': {'deckId': doc_ref.id}}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except auth.InvalidIdTokenError:
        return Response({'error': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
def getAllDecks(request):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        doc_ref = db.collection('users').document(uid).collection('decks').stream()
        decks = []
        for doc in doc_ref:
            deckDict = doc.to_dict()
            decks.append({'id': doc.id, 'title': deckDict['title'], 'numberOfCards': deckDict['numberOfCards']})
        print(decks)

        return Response(decks, status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'error': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def getDeck(request, id):
    auth_header = request.headers['Authorization']
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        doc_ref = db.collection('users').document(uid).collection('decks').document(id)

        return Response(doc_ref.get().to_dict(), status=status.HTTP_200_OK)
    except auth.InvalidIdTokenError:
        return Response({'error': 'Invalid authentication token.'}, status=status.HTTP_401_UNAUTHORIZED)