from django import forms
from .models import Datacart

class DataCartForm(forms.ModelForm):
    class Meta:
        model = Datacart
        fields = ['seoul_data', 'quantity']
        quantity = forms.NumberInput()
        
